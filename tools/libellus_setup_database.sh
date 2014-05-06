#!/bin/bash

echo "Enter wanted CouchDB admin password and hit enter:"
read password

# Check if curl is installed
type curl >/dev/null 2>&1 || { 
    echo >&2 "This script requires curl. Install with sudo apt-get install curl. Aborting."; 
    exit 1; 
}

# Addeding databases
curl -H "Content-Type: application/json" -X PUT http://localhost:5984/libellus 
curl -H "Content-Type: application/json" -X PUT http://localhost:5984/journal 
curl -H "Content-Type: application/json" -X PUT http://localhost:5984/timewatch 
curl -H "Content-Type: application/json" -X PUT http://localhost:5984/chat 
curl -H "Content-Type: application/json" -X PUT http://localhost:5984/chat_users 

# Adding views
curl -H "Content-Type: application/json" -X POST http://localhost:5984/journal -d @main/views/journal/_design_filter.json  
curl -H "Content-Type: application/json" -X POST http://localhost:5984/journal -d @main/views/journal/_design_app.json 
curl -H "Content-Type: application/json" -X POST http://localhost:5984/journal -d @main/views/journal/_design_utils.json 
curl -H "Content-Type: application/json" -X POST http://localhost:5984/chat -d @main/views/chat/_design_filter.json 
curl -H "Content-Type: application/json" -X POST http://localhost:5984/chat -d @main/views/chat/_design_utils.json 


# Adding libellususer
curl -H "Content-Type: application/json" http://localhost:5984/_users -X POST -d '
{
   "_id": "org.couchdb.user:libellususer",
   "name": "libellususer",
   "password": "libellususer",
   "roles": [],
   "type": "user"
}'

# Adding permissions for libellususer on chat_users
curl -H "Content-Type: application/json" -X PUT http://localhost:5984/chat_users/_security -d '
{"admins":{"names":["libellususer"], "roles":[]}}'

# Adding permissions for libellususer on _replicator
curl -H "Content-Type: application/json" -X PUT http://localhost:5984/_replicator/_security -d '
{"admins":{"names":["libellususer"], "roles":[]}}'

# Adding libellusadmin
curl -H "Content-Type: application/json" -X PUT http://localhost:5984/_config/admins/libellusadmin -d "\"$password\""

echo "done"
