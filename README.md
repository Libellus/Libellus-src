Libellus is an open source, cross-platform, ultra portable journal tool for crisis management. It runs in all modern web browsers, ready to use out of the box.

## Installation on Microsoft Windows

Check out the portable release.

## Installation on Ubuntu Linux

Install CouchDB, Git and Curl:
```bash
$ sudo apt-get install couchdb curl git
```

Install CouchApp:
```bash
$ sudo apt-get install python-dev
$ curl -O http://python-distribute.org/distribute_setup.py
$ sudo python distribute_setup.py
$ sudo easy_install pip
$ sudo pip install -U couchapp
$ sudo pip install --upgrade couchapp
```

Start CouchDB:
```bash
$ sudo service couchdb start
```

Clone the Libellus Git repository:
```bash
$ git clone git@github.com:Libellus/Libellus-src.git
```

Change directory into the Libellus-src folder
```bash
$ cd Libellus-src
```

Run the setup_database.sh file to add databases and views:
```bash$ chmod +x ./setup_database.sh
$ ./setup_database.sh
```

Push Libellus to CouchDB. Remember to enter the password chosen from the setup-database.sh script into the URL:
```bash
$ couchapp push main http://libellusadmin:<password>@localhost:5984/libellus
```

Now view Libellus by pointing your web browser to http://localhost:5984/libellus/_design/main/index.html.

## Installation on Mac OS X

Just like the guide on how to install on Ubuntu, but download CouchDB for OS X at http://couchdb.apache.org instead.
