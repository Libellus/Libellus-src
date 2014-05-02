function insertUtilsSection() {
    $('<div id="section_utils" style="display: none;"></div>').appendTo('#main_content');
}

// Display utils
function insertUtilsTable() {

    var html = '';

    // Table export journal
    html += '<table id="table_utils_export_journal">';
      html += '<thead>';
        html += '<tr class="tr_header">';
          html += '<th>Export journal</th>';
          html += '<th>Type</a></th>';
          html += '<th>Content</th>';
          html += '<th>Display in browser</th>';
          html += '<th>Download</th>';
        html += '</tr>';
      html += '</thead>';
      html += '<tbody>';

        html += '<tr>';
          html += '<td>Complete database</td>';
          html += '<td>couchdb-file</td>';
          html += '<td>Text/attachements</td>';
          html += '<td></td>';
          html += '<td><a href="../../../journal.couch" download="journal.couch">Download</a></td>';
        html += '</tr>';

        html += '<tr>';
          html += '<td>XML-data</td>';
          html += '<td>text/xml</td>';
          html += '<td>Text only</td>';
          html += '<td><a href="/journal/_design/utils/_list/xml/by_id?include_docs=true" target="_blank">Display</a></td>';
          html += '<td><a href="/journal/_design/utils/_list/xml/by_id?include_docs=true" download="libellus_journal.xml">Download</a></td>';
        html += '</tr>';

        html += '<tr>';
          html += '<td>JSON-data</td>';
          html += '<td>application/json</td>';
          html += '<td>Text only</td>';
          html += '<td><a href="/journal/_design/filter/_view/all" target="_blank">Display</a></td>';
          html += '<td><a href="/journal/_design/filter/_view/all" download="libellus_journal.json">Download</a></td>';
        html += '</tr>';
      
      html += '</tbody>';
    
    html += '</table>';
    html += '</br>';
    
    // Table export chat
    html += '<table id="table_utils_export_chat">';
      html += '<thead>';
        html += '<tr class="tr_header">';
          html += '<th>Export chat</th>';
          html += '<th>Type</a></th>';
          html += '<th>Content</th>';
          html += '<th>Display in browser</th>';
          html += '<th>Download</th>';
        html += '</tr>';
      html += '</thead>';
      html += '<tbody>';

        html += '<tr>';
          html += '<td>Complete database</td>';
          html += '<td>couchdb-file</td>';
          html += '<td>Text/attachements</td>';
          html += '<td></td>';
          html += '<td><a href="../../../chat.couch" download="chat.couch">Download</a></td>';
        html += '</tr>';

        html += '<tr>';
          html += '<td>XML-data</td>';
          html += '<td>text/xml</td>';
          html += '<td>Text only</td>';
          html += '<td><a href="/chat/_design/utils/_list/xml/by_id?include_docs=true" target="_blank">Display</a></td>';
          html += '<td><a href="/chat/_design/utils/_list/xml/by_id?include_docs=true" download="libellus_chat.xml">Download</a></td>';
        html += '</tr>';

        html += '<tr>';
          html += '<td>JSON-data</td>';
          html += '<td>application/json</td>';
          html += '<td>Text only</td>';
          html += '<td><a href="/chat/_design/filter/_view/all" target="_blank">Display</a></td>';
          html += '<td><a href="/chat/_design/filter/_view/all" download="libellus_chat.json">Download</a></td>';
        html += '</tr>';
      
      html += '</tbody>';
    
    html += '</table>';
    html += '</br>';
    
    // Table IP information
    html += '<table id="table_utils_information">';
      html += '<thead>';
        html += '<tr class="tr_header">';
          html += '<th>Your IP address is</th>';
          html += '<th>This instance can be visited externally via</th>';
        html += '</tr>';
      html += '</thead>';
      html += '<tbody>';
      html += '</tbody>';
    html += '</table>';
    html += '</br>';
    
    // Table manually add
    html += '<table id="table_manually_add">';
      html += '<thead>';
        html += '<tr class="tr_header">';
          html += '<th>Manually add to replicator</th>';
          html += '<th> </th>';
        html += '</tr>';
      html += '</thead>';
      html += '<tbody>';
      html += '<td><div class="input-group"> <span class="input-group-addon">IP address or domain name</span>';
      html += '<input type="text" id="manually_add" class="form-control" placeholder="127.0.0.1" />';
      html += '<span class="input-group-btn">';
      html += '<button id="manually_add_btn" class="btn btn-secondary" title="Add">Add</button>';
      html += '</span></div></td>'
      html += '</tbody>';
    html += '</table>';
    html += '</br>';

    // Table replicator
    html += '<table id="table_utils_replicator">';
      html += '<thead>';
        html += '<tr class="tr_header">';
          html += '<th>Replicate</th>';
          html += '<th>Status</th>';
        html += '</tr>';
      html += '</thead>';
      html += '<tbody>';
      html += '</tbody>';
      
    html += '</table>';
    html += '</br>';
    html += '<button id="del_repl" type="button" class="btn btn-secondary pull-right" title="Delete">Empty replicator database</button>';
    /* Apply changes to the html */
    $('#section_utils').append(html);
}

// Displays all the replication documents in _replicator with status
function replicationStatus() {
    // Get all documents from _replicator database, except design
    $.getJSON("/_replicator/_all_docs?&skip=1&include_docs=true", function(data) {
        var html = '';
        for (number in data.rows) {   
            var replicate = data.rows[number].id;
            // There are three forms of statuses, triggered, error and completed
            // We are running continuous replication, and replication will then never be completed
            if (data.rows[number].doc._replication_state == "triggered") {
                // Sets the title and CSS for the buttons
                var repl_status = "Triggered";
                var repl_btn = "btn-success disabled";
            } else {
                var repl_status = "Error";
                var repl_btn = "btn-danger disabled";
            }
            html += '<tr>';
            // Uses the name from the replication database
            // This is very descriptive, e.g. "receiving_chat_users_from_10.0.0.13"
            html += '<td>' + replicate + '</td>';
            html += '<td><button id="repl_status" type="button" class=' + repl_btn +'>' + repl_status + '</button></td>';
            html += '</tr>';
        }
        $('#table_utils_replicator > tbody').html(html);
    });
}

// Removes all documents from _replicator
// The user needs admin rights or special rights for the _replicator database for this
$(document).on('click', '#del_repl', function(e) {
    // For all documents, except design
    $.getJSON("/_replicator/_all_docs?&skip=1&include_docs=true", function(data) {
        // Iterates through all rows with data
        for (number in data.rows) {
            var doc = { 
                _id: data.rows[number].id,
                _rev: data.rows[number].value.rev
            }
            // Removes the doc from _replicator
            $.couch.db("_replicator").removeDoc(doc, {
                success: function(data) {
                    console.log(data);
                },
                error: function(status) {
                    console.log(status);
                }
            });            
        }
    });
});

// Lets the user manually add IPs to the replicator
// The $.couch.replicate -function from the plugin cannot be used, 
//  because this is for the old replicator-solution in CouchDB
$(document).on('click', '#manually_add_btn', function(e) {
    e.preventDefault();
    var target = $('#manually_add').val();
    // Databases to replicate
    var databases=["journal", "chat", "chat_users"];
    // URL for the local CouchDB instance
    var url = 'https://127.0.0.1:6984/_replicator';
    
    // JSON data
    for (database in databases) {
        var receiving_data = {
            _id:"receiving_"+databases[database]+"_from_"+target,
            source:"https://libellususer:libellususer@"+target+":6984/"+databases[database],
            target:"https://libellususer:libellususer@127.0.0.1:6984/"+databases[database],
            continuous: true,
            create_target: true,
            user_ctx: {
                name: "libellususer",
                roles: []
            }
        }
        
        var sending_data = {
            _id:"sending_"+databases[database]+"_to_"+target,
            source:"https://libellususer:libellususer@127.0.0.1:6984/"+databases[database],
            target:"https://libellususer:libellususer@"+target+":6984/"+databases[database],
            continuous: true,
            create_target: true,
            user_ctx: {
                name: "libellususer",
                roles: []
            }
        }
        // Adds the doc to replicator, both TX/RX
        $.couch.db("_replicator").saveDoc(receiving_data);
        $.couch.db("_replicator").saveDoc(sending_data);
    }
    $('#manually_add').val('');

});

// Displays all local IP addresses by using WebRTC
// Borrowed from: 
// https://github.com/natevw/ipcalf/blob/master/_attachments/network_ip.html
function returnLocalIP() {
    var RTCPeerConnection = window.webkitRTCPeerConnection || window.mozRTCPeerConnection;

    if (RTCPeerConnection) (function () {
        var rtc = new RTCPeerConnection({iceServers:[]});
        // FF needs a channel/stream to proceed
        if (window.mozRTCPeerConnection) {      
            rtc.createDataChannel('', {reliable:false});
        };
        
        rtc.onicecandidate = function (evt) {
            if (evt.candidate) grepSDP(evt.candidate.candidate);
        };
        rtc.createOffer(function (offerDesc) {
            grepSDP(offerDesc.sdp);
            rtc.setLocalDescription(offerDesc);
        }, function (e) { console.warn("offer failed", e); });
        
        var addrs = Object.create(null);
        addrs["0.0.0.0"] = false;
        
        function updateDisplay(newAddr) {
            if (newAddr in addrs) return;
            else addrs[newAddr] = true;
            var displayAddrs = Object.keys(addrs).filter(function (k) { return addrs[k]; });
            var html = '';
            for (var i = 0; i < displayAddrs.length; i++) {
                html += '<tr>';
                html += '<td>' + displayAddrs[i] + '</td>';
                html += '<td>https://' + displayAddrs[i] + ':6984/libellus/index.html</td>';
                html += '</tr>';
            } $('#table_utils_information > tbody').html(html);  
        }

        function grepSDP(sdp) {
            var hosts = [];
            sdp.split('\r\n').forEach(function (line) { // c.f. http://tools.ietf.org/html/rfc4566#page-39
                if (~line.indexOf("a=candidate")) {     // http://tools.ietf.org/html/rfc4566#section-5.13
                    var parts = line.split(' '),        // http://tools.ietf.org/html/rfc5245#section-15.1
                        addr = parts[4],
                        type = parts[7];
                    if (type === 'host') updateDisplay(addr);
                } else if (~line.indexOf("c=")) {       // http://tools.ietf.org/html/rfc4566#section-5.7
                    var parts = line.split(' '),
                        addr = parts[2];
                    updateDisplay(addr);
                }
            });
        }
    })(); else {
        // Outputs a message to non supported browsers.
        var html = '';
        html += '<tr>';
        html += '<td>No IP addresses registered. Your browser does probably not support WebRTC. Libellus will still work.</td>';
        html += '</tr>';
        $('#table_utils_information > tbody').html(html);   
    } 
}

$(document).ready(function() {
    insertUtilsSection();
    insertUtilsTable();
    replicationStatus();
    returnLocalIP();
    // Check for replication status
    setInterval(replicationStatus, 5000);
    setInterval(returnLocalIP, 5000);

});
