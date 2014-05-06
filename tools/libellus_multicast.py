# Code by: Libellus
# http://libellus.no
# Based on multicast_example.py
# https://gist.github.com/aaroncohen/4630685
# Written by Aaron Cohen -- 1/14/2013
#
# This work is licensed under a Creative Commons Attribution 3.0 Unported License.
# See: http://creativecommons.org/licenses/by/3.0/

import sys
import re
import socket
import time
import json
import urllib2
import httplib
from threading import Thread

def extract_ips(ip_data):
    # Extract IP addresses from getaddrinfo using regex, while skipping loopback
    regex = "^(?!127)(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$"
    return re.match(regex, ip_data) is not None

def get_local_ips():
    # socket.getaddrinfo returns much information, we only need the IPs 
    local_ips = [ x[4][0] for x in socket.getaddrinfo(socket.gethostname(), 80)
                  if extract_ips(x[4][0]) ]

    # If no addresses are found, try another way by opening a connection to a known server              
    if not local_ips:
        # create a standard UDP socket ( SOCK_DGRAM is UDP, SOCK_STREAM is TCP )
        temp_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        try:
            # Open a connection to one of Googles DNS servers
            temp_socket.connect(('8.8.8.8', 9))
            # Get the interface used by the socket
            local_ips = [temp_socket.getsockname()[0]]
        except socket.error:
            pass
        finally:
            # Close socket when done
            temp_socket.close()

    # If no IP addresses are found, wait for 60 seconds and try again
    if not local_ips:
        time.sleep(60)
        get_local_ips()
    return local_ips


def create_socket(multicast_ip, port, local_ip):
    # create a UDP socket
    my_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

    # allow reuse of addresses
    my_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

    # set multicast interface to local_ip
    my_socket.setsockopt(socket.IPPROTO_IP, socket.IP_MULTICAST_IF, socket.inet_aton(local_ip))

    # Set multicast time-to-live to 1
    # This is to stop data from escaping the local network
    my_socket.setsockopt(socket.IPPROTO_IP, socket.IP_MULTICAST_TTL, 1)

    # Construct a membership request...tells router what multicast group we want to subscribe to
    membership_request = socket.inet_aton(multicast_ip) + socket.inet_aton(local_ip)

    # Send add membership request to socket
    # See http://www.tldp.org/HOWTO/Multicast-HOWTO-6.html for explanation of sockopts
    my_socket.setsockopt(socket.IPPROTO_IP, socket.IP_ADD_MEMBERSHIP, membership_request)

    # Bind the socket to an interface.
    # If you bind to a specific interface on the Mac or Linux, no multicast data will arrive
    # If you try to bind to all interfaces on Windows, no multicast data will arrive
    if sys.platform.startswith("darwin") or sys.platform.startswith("linux"):
        my_socket.bind(('0.0.0.0', port))
    else:
        my_socket.bind((local_ip, port))
    return my_socket

def listen_loop(multicast_ip, port):
    # Get all IP addresses assigned to the local network interfaces
    local_ips = get_local_ips()

    # Start a new listen thread for each IP
    for local_ip in local_ips:
        my_socket = create_socket(multicast_ip, port, local_ip)
        t = Thread(target=listen_content, args=(local_ip, my_socket,))
        t.start()

def current_milli_time():
    return int(round(time.time() * 1000))

def listen_content(local_ip, my_socket):

    # Set a timestamp for startup
    timer = current_milli_time()
    # Adds the local IP address to the array
    # This is done to prevent communication with yourself
    #   in case of several network cards
    added_array = [local_ip]

    while True:
        data, address = my_socket.recvfrom(4096)

        # If the found IP address is not in the array
        if data not in added_array:
            # Add to array
            added_array.extend([data])
            # Send replication data (IP) to the local CouchDB instance
            json_send(data)

        # Empty the array after some time
        #   to make it possible to use the "clean replication"
        #   button in Libellus Utils and getting new data
        if (current_milli_time() - 120000) < timer:
            try_connect()
            del added_array[:]
            added_array = [local_ip]
            timer = current_milli_time()

def json_send(target):
    # URL for the local CouchDB instance
    url = 'https://127.0.0.1:6984/_replicator'
    # Databases to replicate
    databases = ['journal','chat','chat_users']
    
    
    # JSON data
    for database in databases:
        receiving_data = {
        "_id":"receiving_"+database+"_from_"+target+"",
        "source":"https://libellususer:libellususer@"+target+":6984/"+database+"",
        "target":"https://libellususer:libellususer@127.0.0.1:6984/"+database+"",
        "continuous": True,
        "create_target": True,
        "user_ctx":{
            "name":"libellususer",
            "roles":[]
            }
        }

        sending_data = {
        "_id":"sending_"+database+"_to_"+target+"",
        "source": "https://libellususer:libellususer@127.0.0.1:6984/"+database+"",
        "target": "https://libellususer:libellususer@"+target+":6984/"+database+"",
        "continuous": True,
        "create_target": True,
        "user_ctx": {
            "name": "libellususer",
            "roles": []
            }
        }
        
        # Send data for each database both Tx/Rx
        json_sender(receiving_data, url)
        json_sender(sending_data, url)
        

def json_sender(data_type, url):
    # Create a request and send the JSON data
    req = urllib2.Request(url)
    req.add_header('Content-Type', 'application/json')
    req.get_method = lambda: 'POST'
    
    try:
        response = urllib2.urlopen(req, json.dumps(data_type))
        response.close()
    # Handle error if entry already exists in database
    except urllib2.HTTPError as e:
        pass
    # Handle connection error, exit script
    # This will occur if CouchDB is not running
    except IOError:
        sys.exit(0)
        
def try_connect():
    # Check if local Libellus is running, else close the script
    try:
        connection = httplib.HTTPSConnection('127.0.0.1', 6984, timeout=2)
        connection.connect()
        connection.close()
    except:
        sys.exit(0)

def announce_loop(multicast_ip, port):
    # Offset the port by one so that we can send and receive on the same machine
    port+1

    # Get all IP addresses assigned to the local network interfaces
    local_ips = get_local_ips()

    # Start a new announce thread for each IP
    for local_ip in local_ips:
        my_socket = create_socket(multicast_ip, port, local_ip)
        t = Thread(target=announce_content, args=(local_ip, my_socket, multicast_ip, port,))
        t.start()
    
def announce_content(local_ip, my_socket, multicast_ip, port):
    while True:
        # Send data. Destination must be a tuple containing the IP and port.
        my_socket.sendto(local_ip, (multicast_ip, port))
        time.sleep(5)
        try_connect()

if __name__ == '__main__':
    # Choose an arbitrary multicast IP and port.
    # 239.255.0.0 - 239.255.255.255 are for local network multicast use.
    # Remember, you subscribe to a multicast IP, not a port. All data from all ports
    # sent to that multicast IP will be echoed to any subscribed machine.
    multicast_address = "239.255.133.7"
    multicast_port = 6980

    # Starts a thread for the listening interface
    listen = Thread(target=listen_loop, args=(multicast_address, multicast_port,))
    listen.start()

    # Starts a thread for the announce interface
    announce = Thread(target=announce_loop, args=(multicast_address, multicast_port,))
    announce.start()
