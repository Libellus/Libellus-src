function insertChatSection() {
    $('<div id="section_chat" style="display: none;"></div>').appendTo('#main_content');
}

// Display utils
function insertChatTable() {

    var html = '';

    html += '<div id="table_chat">';
        html += '<div class="pull-right">';
          html += '<div style="background-color:#FFC002; height: 20px;"><strong>Online Users</strong></div>';
          html += '<div id="chat_names" style="vertical-align:top;" />';
        html += '</div>';
        html += '<div>';
          html += '<div style="background-color:#FFC002; height: 20px;"><strong>Chat Board</strong></div>';
          html += '<div id="chat_content" style="vertical-align:top;" />';
        html += '</div>';
    html += '</div>';
    
    html += '<div>'
        html += '<form id="chat_form" action="" method="post">';
          html += '<div class="col-lg-6" style="padding-left:0%; margin-top:1%;">';
            html += '<div class="input-group">';
              html += '<input id="chat_msg" type="text" class="form-control">';
              html += '<span class="input-group-btn">';
                html += '<input id="chat_submit" class="btn btn-secondary" type="submit" value="Post" />';
              html += '</span>';
            html += '</div>';
          html += '</div>';
        html += '</form>';
    html += '</div>';
    
    // Apply changes to the html
    $('#section_chat').append(html);
}

function getChangedChatDocs() {
    // We store the start time of the function to know if it has exeeded it's time limit
    var timestamp_start = (new Date()).getTime();
    
    var url = '/chat/_changes?since=' + getCookie('chat_last_seq');
        
    // Could have used this, but the second argument in changes() gets encoded, so it doesnt work.
    //$.couch.db("journal").changes(0, "?filter=app/type&type=JOR").onChange(function(data) {});
    $.getJSON(url, function(changes) {

        // Now we update the last sequence number, so we don't fetch old ones next time.
        document.cookie = 'chat_last_seq=' + changes.last_seq;
        
        // Remove deleted docs
        function filterDeleted(element) {
            return element.deleted != true;
        } 
        
        // A new array with deleted docs filtered out
        var filtered_changes = changes.results.filter(filterDeleted);
        
        var i = 0;
        var len = filtered_changes.length;
        
        if (len > 0) {
            $.each(filtered_changes, function(index, item) {
                $.couch.db('chat').openDoc(item.id, {
                    success: function(doc) {
                        insertChatEntry(doc);
                        // When we have all currently new changes
                        if (++i == len) {
                            var time_used = (new Date()).getTime() - timestamp_start;
                            if (time_used < cfg_upd_chat_intval) {
                                setTimeout(getChangedChatDocs, cfg_upd_chat_intval - time_used); 
                            } else { 
                                getChangedChatDocs();
                            }
                        }
                    },

                });
            });
        } else {
            var time_used = (new Date()).getTime() - timestamp_start;
            if (time_used < cfg_upd_chat_intval) {
                setTimeout(getChangedChatDocs, cfg_upd_chat_intval - time_used); 
            } else { 
                getChangedChatDocs();
            }
        }
    });
}

// Output the same username, but with a color
// Based on: http://stackoverflow.com/questions/3426404/create-a-hexadecimal-colour-based-on-a-string-with-javascript
function setUserColor(username) {
    var hash = 0;
    for (var i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    var color = '#';
    for (var i = 0; i < 3; i++) {
        var value = (hash >> (i * 8)) & 0xFF;
        color += ('00' + value.toString(16)).substr(-2);
    }
    return '<span style="font-weight:bold; color:' + color + ';">' + username + '</span>';
}

// Fetch all online users and displays them in the "Users Online"-section
function insertOnlineUsersList() {
    var html = '';
    var url = '/chat_users/_changes?since=0';
        
    // Could have used this, but the second argument in changes() gets encoded, so it doesnt work.
    //$.couch.db("journal").changes(0, "?filter=app/type&type=JOR").onChange(function(data) {});
    $.getJSON(url, function(changes) {

        // Remove deleted docs
        function filterDeleted(element) {
            return element.deleted != true;
        } 
        
        // A new array with deleted docs filtered out
        var filtered_changes = changes.results.filter(filterDeleted);
        
        var i = 0;
        var len = filtered_changes.length;
        
        $.each(filtered_changes, function(index, item) {
            $.couch.db('chat_users').openDoc(item.id, {
                success: function(data) {
                    // We will only print out every user that is not idle
                    var idle = Math.floor((glob_local_timestamp - data['last_timestamp_local']));
                    if (idle < cfg_upd_chat_idle) {
                        if (data['user'] != '') {
                            html += setUserColor(data['user']) + ' (' + idle / 1000 + 's)</br>';
                        }
                    }
                    // When we got all docs, we print them out
                    if (++i == len) {
                        $('#chat_names').html(html);
                    }
                }
            });
        });
    });
}

// Removes old instances of users. ie. deletes old revisions
function removeOldUsers() {
    $.couch.db('chat_users').compact({
        success: function(resp) {
            console.log("Compacted chat users");
        }
    });
}

function initOwnUser(callback) {
    var new_doc = {'user': getCookie('username'), 'last_timestamp_local': glob_local_timestamp};
    $.couch.db('chat_users').saveDoc(new_doc, {
        success: function(resp) {
            callback(resp.id);
        }
    });
}

// Inserts the username into the chat_users database, which is a way to keep track of who is online and not.
//  Finally the function displays online users.
function updateOwnUser() {
    $.couch.db('chat_users').openDoc(getCookie('chat_user_id'), {
        success: function(doc) {
            var new_doc = {
                '_id': doc['_id'],
                '_rev': doc['_rev'],
                'user': getCookie('username'), 
                'last_timestamp_local': glob_local_timestamp,
            };
            // Saves the update
            $.couch.db('chat_users').saveDoc(new_doc, {
                success: function(resp) {
                    console.log("Updated own chat user");
                }
            });
        
        }
    });
}

// Inserts a message in the chat
function insertChatEntry(doc) {
    if (doc['user'] != '' && doc['user'] != undefined) {
        if (doc.added_timestamp_external) {
            var html = '[' + moment(doc.added_timestamp_external).format('YYYY/MM/DD HH:mm:ss ZZ') + '] ' + 
                        setUserColor(doc['user']) + ': ' + escapeHtml(doc['msg']) + '<br />';
        } else {
            var html = '[' + moment(doc.added_timestamp_local).format('YYYY/MM/DD HH:mm:ss ZZ') + '] ' + 
                        setUserColor(doc['user']) + ': ' + escapeHtml(doc['msg']) + '<br />';
        }
    }
    $('#chat_content').append(html);
}

$(document).ready(function() {

    document.cookie = 'chat_last_seq=0';

    insertChatSection();
    insertChatTable();
    
    // Initialize the chat user, by setting creating a doc and setting a cookie with the doc id.
    // The doc id will be the user id.
    if (getCookie('chat_user_id') == undefined || getCookie('chat_user_id') == '') {
        initOwnUser(function(user_id) {
            document.cookie = 'chat_user_id=' + user_id;
        });
    } else {
        console.log('chat_user_id already set');
    }
    
    
    getChangedChatDocs();
    
    setInterval(updateOwnUser, cfg_upd_chat_own_user);
    
    setInterval(removeOldUsers, cfg_upd_chat_remove_old_users);
    
    insertOnlineUsersList();
    setInterval(insertOnlineUsersList, cfg_upd_chat_user_list);
    
});

// Add new chat message
$(document).on('submit', '#chat_form', function(e) {
    e.preventDefault();
    var obj_info = {
        'type': 'chat',
        'msg': $('#chat_msg').val(),
        'user': getCookie('username'),
        'added_timestamp_local': glob_local_timestamp,
        'added_timestamp_external': glob_external_timestamp
    }
    
    $.couch.db('chat').saveDoc(obj_info, {
        success: function(data) {
            // Clears form
            $('#chat_msg').val('');
            // Scrolls down to bottom
            $('#chat_content').animate({ 
               scrollTop: $('#chat_content')[0].scrollHeight}, 500, 'linear'
            );
        }
    });
});

// Scroll to bottom when someone focuses on the chat
$(document).on('focus', '#chat_msg', function(e) {
    $('#chat_content').animate({ 
        scrollTop: $('#chat_content')[0].scrollHeight}, 500, 'linear'
    );
});
    
