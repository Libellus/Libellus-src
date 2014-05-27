var glob_journal_counter = 0;


// Inserts the structure of the journal section
function insertJournalSection() {
    var html = '';
    html += '<div id="section_journal" style="display:none; overflow:hidden;">';  
    html +=   '<div id="search_form" class="container">';
    html +=     '<div class="row">';
    html +=       '<div class="col-md-4">';
    html +=         '<div class="input-group">';
    html +=           '<span class="input-group-addon">From</span>';
    html +=           '<input type="text" id="search_time_from" class="form-control" placeholder="yyyy/mm/dd hh:mm:ss" />';
    html +=           '<span class="input-group-btn">';
    html +=             '<button id="search_time_from_clear" class="btn btn-secondary"> <span class="glyphicon glyphicon-trash"></span></button>';
    html +=           '</span>';
    html +=         '</div>';
    html +=       '</div>';
    html +=       '<div class="col-md-4">';
    html +=         '<div class="input-group">';
    html +=           '<span class="input-group-addon">To</span>';
    html +=           '<input type="text" id="search_time_to" class="form-control" placeholder="yyyy/mm/dd hh:mm:ss" />';
    html +=           '<span class="input-group-btn">';
    html +=             '<button id="search_time_to_clear" class="btn btn-secondary"> <span class="glyphicon glyphicon-trash"></span></button>';
    html +=           '</span>';
    html +=         '</div>';
    html +=       '</div>';
    html +=       '<div class="col-md-4">';
    html +=         '<div class="input-group">';
    html +=           '<span class="input-group-addon">Search</span>';
    html +=           '<input type="text" id="search_str" class="form-control" placeholder="Keywords" />';
    html +=           '<span class="input-group-btn">';
    html +=             '<button id="search_str_clear" class="btn btn-secondary"> <span class="glyphicon glyphicon-trash"></span></button>';
    html +=           '</span>';
    html +=         '</div>';
    html +=       '</div>';
    html +=     '</div>'; // End row
    html +=   '</div>'; // End cont   
    html +=   '<div id="footer">';
    html +=     '<div id="footer_top" class="text-center">';
    html +=       '<a id="footer_toggle" href=""><span class="glyphicon glyphicon-pencil"></span> Write New Journal Entry</a>';
    html +=     '</div>';
    html +=     '<div id="footer_bot" class="container">';
    html +=       '<div class="col-sm-7">';
    html +=         '<form class="form-inline" action="#" method="get">';
    html +=           '<input id="add_journal_subject" placeholder="Subject" size="78" class="form-control" />';
    html +=           '<textarea id="add_journal_cont" style="resize: vertical;" cols="80" rows="4" placeholder="Content" class="form-control"></textarea>';
    html +=           '<input id="add_journal_keywords" type="text" placeholder="Keywords" class="form-control" />';
    html +=           '<div class="input-group col-sm-8" style="padding-left:0px;">';
    html +=             '<input id="add_journal_event_time" placeholder="Event Time" type="text" class="form-control" />';
    html +=             '<div class="input-group-btn dropup">';
    html +=               '<div class="dropdown">';
    html +=                 '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">';
    html +=                   '<span id="add_journal_class_label" style="color:#333333;">Classification</span> <span class="caret"></span>';
    html +=                 '</button>';
    html +=                 '<ul id="add_journal_class_select" class="dropdown-menu">';
    
    $.each(cfg_classifications, function(index, value) {
        html +=               '<li><a href="#">' + value + '</a></li>';
    });
    
    html +=                 '</ul>';
    html +=               '</div>';
    html +=               '<input id="add_journal_class" type="hidden" class="class_value">';
    html +=             '</div>';
    html +=           '</div>';
    html +=           '<button id="add_journal_btn" class="btn btn-tertiary col-sm-3 pull-right" type="submit">Add Entry</button>';
    html +=         '</form>';
    html +=       '</div>';
    html +=     '</div>';
    html +=   '</div>'; // End footer
    html += '</div>'; // End section
    
    $('#main_content').append(html);
}

// Inserts a journal entry with structure for appendices and appendix form
// Inserts a journal entry with structure for appendices and appendix form
function insertJournalEntry(doc) {
    var html = '';
    html += '<tr name="journal_entry_metadata" class="row-vm journal_view_header" data-id="' + doc._id + '">';
    html +=   '<td>' + ++glob_journal_counter + '</td>';
    html +=   '<td>' + escapeHtml(doc.author) + '</td>';
    html +=   '<td>' + wordwrap(escapeHtml(doc.subject), 60, '<br />', 1) + '</td>';
    html +=   '<td>' +  moment(doc.event_time).format('YYYY/MM/DD HH:mm:ss ZZ') + '</td>';
    html +=   '<td title="' + doc.classification + '">' + classReplacement(doc.classification) + '</td>';
    html +=   '<td>&nbsp;</td>'; // Here comes the number of comments
    html +=   '<td>&nbsp;</td>'; // Here comes the number of actions
    html +=   '<td title="YYYY-MM-DD HH:MM:SS TZ (Difference from external and local time)" nowrap>' + moment(doc.added_timestamp_local).format('YYYY/MM/DD HH:mm:ss ZZ');
    
    // If the doc doesn't have Internet time, then we display "N/A" in the offset
    if (doc.added_timestamp_external) {
        offset = getTimeOffset(doc.added_timestamp_external, doc.added_timestamp_local);
        html += ' (' + (offset >= 0? '+' :'-') + Math.round(offset / 1000) + ')';
    } else {
        html += ' (N/A)';
    }
    
    html +=   '</td>';
    html += '</tr>';
    html += '<tr name="journal_entry_content" class="row-details expand-child" data-id="' + doc._id + '">';
    html +=   '<td class="journal_view_content" colspan="8">' + wordwrap(doc.content, 120, '<br />', 1);
    
    if (doc.keywords) {
        html += ' <span class="keywords">(' + escapeHtml(doc.keywords) + ')</span>';
    }
    
    html +=   '</td>';
    html += '</tr>';
    html += '<tr name="journal_entry_appendices" class="expand-child" data-id="' + doc._id + '">';
    html +=   '<td data-id="' + doc._id + '" colspan="8" style="border: 0px;">';
  
    // Appendix table
    html += '<table name="table_appendix" data-id="' + doc._id + '" style="display:none;" class="tablesorter-child">';
    html +=   '<thead>';
    html +=     '<tr>';
    html +=       '<th><span>Author</span></th>';
    html +=       '<th><span>Comment</span></th>';
    html +=       '<th><span>Marked solved by</span></td>';
    html +=       '<th><span>Attachment / Deadline</span></th>';
    html +=       '<th><span>Added Time (Offset)</span></th>';
    html +=       '<th>Goto</th>';
    html +=     '</tr>';
    html +=   '</thead>';
    html +=   '<tbody>';
    html +=   '</tbody>';
    html += '</table>';

    html +=   '</td>';
    html += '</tr>';
    html += '<tr name="journal_entry_appendix_form" class="row-details expand-child" data-id="' + doc._id + '">';
    html +=   '<td name="appendix_form" data-id="' + doc._id + '" colspan="8">';
    
    // Appendix submission form
    html += '<table name="table_appendix_form" data-id="' + doc._id + '" style="margin-top:20px; display:none;">';
    html +=   '<tr>';
    html +=     '<td>';
    html +=       '<form class="add_appendix" id="' + doc._id + '" method="post" action="" enctype="multipart/form-data">';
    html +=         '<input id="add_appendix_refers_to" type="hidden" value="' + doc._id + '" />';
    html +=         '<select id="add_appendix_type" data-id="' + doc._id + '">';
    html +=           '<option value="comment" default>Comment</option>';
    html +=           '<option value="action">Action</option>';
    html +=         '</select><br />';
    html +=         '<div class="row">';
    html +=           '<div style="float:left;" class="col-md-4">';
    html +=             '<textarea id="add_appendix_cont" style="resize: vertical;" cols="80" rows="4" class="form-control" placeholder="Content"></textarea>';
    html +=           '</div>';
    html +=           '<input id="_id" name="_id" type="hidden" />';
    html +=           '<input id="_rev" name="_rev" type="hidden" />';
    html +=           '<input id="_db" name="_db" type="hidden" value="journal" />';
                
    html +=           '<div name="add_appendix_type_action" style="display:none;" class="col-md-4" data-id="' + doc._id + '">';
    html +=             '<div class="input-group">';
    html +=               '<span class="input-group-addon">Add a deadline</span>';
    html +=               '<input id="add_appendix_deadline" placeholder="yyyy/mm/dd hh:mm:ss" type="text" class="form-control" size="33" />';
    html +=            '</div>';
    html +=            '<div class="input-group">';
    html +=              '<span class="input-group-addon">Who is responsible</span>';
    html +=              '<input id="add_appendix_responsible" placeholder="Username, real name, role etc" size="33" type="text" class="form-control" />';
    html +=            '</div>';
    html +=          '</div>';
                
    html +=          '<div name="add_appendix_type_comment" class="col-md-4" data-id="' + doc._id + '">';
    html +=            '<span class="label label-secondary">Upload file or use filed copy</span>';
    html +=            '<div class="input-group">';
    html +=              '<span class="input-group-btn">';
    html +=                '<span class="btn btn-secondary btn-file">';
    html +=                  'Browse&hellip; <input id="_attachments" name="_attachments" type="file" class="form-control" style="width:100%;" />';
    html +=                '</span>';
    html +=              '</span>';
    html +=              '<input id="add_attachment_filename_label" type="text" class="form-control" readonly>';
    html +=            '</div>';
    html +=            '<div class="input-group">';
    html +=              '<span class="input-group-addon">Filed copy</span>';
    html +=              '<span class="input-group-addon"><input id="add_appendix_use_filed_copy" type="checkbox"/></span>';
    html +=              '<input id="add_appendix_filed_copy" type="text" value="' + randStr(5) + '" size="28" readonly class="text-center form-control"/>';
    html +=            '</div>';
    html +=          '</div>';
                
    html +=          '<div style="float:left; padding-left:3%;">';
    html +=            '<input name="appendix_submit_button" type="submit" class="btn btn-secondary" class="Submit" value="Add comment" data-id="' + doc._id + '"/>';
    html +=          '</div>';

    html +=        '</div>';
    html +=      '</form>';
    html +=   '</td>';
    html +=   '</tr>';
    html += '</table>';
    
    html +=   '</td>';
    html += '</tr>';
    $('#table_journal > tbody').append(html);
}

// Inserts a comment into the journal entry
function insertJournalComment(doc) {
    var html = '';
    html += '<tr>';
    html += '<td>' + escapeHtml(doc.author) + '</td>';
    html += '<td>' + escapeHtml(doc.content) + '</td>';
    html += '<td>&nbsp;</td>';
    html += '<td>';

    // Checks whether filed copy code was used instead for an uploaded attachment.
    if (doc.filed_copy && !doc.attachments) {
        html += 'Filed copy: ' + doc.filed_copy;
    } else {
        // Iterates through all the attachments
        $(doc._attachments).each(function(index, atch) {
            for (var key in atch) {
                html += '<a href="/journal/' + doc._id + '/' + key + '" target="_blank" >' + key + '</a>';
                html += ' (' + bytesPrefix(atch[key].length) + ')';
            }
        });
    }
    html += '</td>';
    
    html += '<td nowrap>' + moment(doc.added_timestamp_local).format('YYYY/MM/DD HH:mm:ss ZZ');
    
    // If the doc doesn't have Internet time, then we display "N/A" in the offset
    if (doc.added_timestamp_external) {
        offset = getTimeOffset(doc.added_timestamp_external, doc.added_timestamp_local);
        html += ' (' + (offset >= 0? '+' :'-') + Math.round(offset / 1000) + ')';
    } else {
        html += ' (N/A)';
    }

    html +=   '</td>';
    html +=   '<td>&nbsp;</td>';
    html += '</tr>';
    
    if ($('table[name=table_appendix][data-id=' + doc.refers_to + '] > tbody').length == 0) {
        console.log("Could not insert html. 'table[name=table_appendix][data-id=' + doc.refers_to + '] > tbody' does not exist");
    } else {
        $('table[name=table_appendix][data-id=' + doc.refers_to + '] > tbody').append(html);
    }
}

// Removes all entries inside the journal table
function removeAllJouralEntries() {
    $('#table_journal > tbody > tr').remove();
}

// Removes all appendices inside the journal table
function removeAllAppendices() {
    $('table[name=table_appendix] > tbody > tr').remove();
}

// Removes a single appendix entry
function removeAppendixEntry(doc) {
    if ($('table[name=table_appendix][data-id=' + doc.refers_to + '] > tbody > tr[data-id=' + doc._id + ']').length > 0 ) {
        $('table[name=table_appendix][data-id=' + doc.refers_to + '] > tbody > tr[data-id=' + doc._id + ']').remove();
    }
}

// Insert action entry into the journal
function insertJournalAction(doc) {
    // If the entry already exist, we remove it first to hinder duplicates.
    removeAppendixEntry(doc);
    
    var html = '';
    html += '<tr data-id="' + doc._id + '" data-solved="' + doc.solved + '">';
    html += '<td>' + escapeHtml(doc.author) + '</td>';
    html += '<td>' + escapeHtml(doc.content) + '</td>';
    html += '<td>' + (doc.solved_by_username == null? '&nbsp;' : escapeHtml(doc.solved_by_username)) + '</td>';
    html += '<td>' + moment(doc.deadline).format('YYYY/MM/DD HH:mm:ss ZZ') + '</td>';
    html += '<td nowrap>' + moment(doc.added_timestamp_local).format('YYYY/MM/DD HH:mm:ss ZZ');
    
    // If the doc doesn't have Internet time, then we display "N/A" in the offset
    if (doc.added_timestamp_external) {
        offset = getTimeOffset(doc.added_timestamp_external, doc.added_timestamp_local);
        html += ' (' + (offset >= 0? '+' :'-') + Math.round(offset / 1000) + ')';
    } else {
        html += ' (N/A)';
    }

    html += '</td>';
    html += '<td><a name="journal_entry_goto_action" href="" data-id="' + doc._id + '"><span style="color:#333333;" class="glyphicon glyphicon-hand-right"></span></a></td>';
    html += '</tr>';

    if ($('table[name=table_appendix][data-id=' + doc.refers_to + '] > tbody').length == 0) {
        console.log("Could not insert html. 'table[name=table_appendix][data-id=' + doc.refers_to + '] > tbody' does not exist");
    } else {
        $('table[name=table_appendix][data-id=' + doc.refers_to + '] > tbody').append(html);
    }
}

// Get and update the number of comments and actions of all appendices
function updateNumAppendices() {

    var num_comments, num_actions;
    // Iterates through all appendix tables
    $('#table_journal > tbody > tr[name=journal_entry_appendices]').each(function() {

        num_comments = 0;
        num_actions = 0;
        
        // Iterates through all rows inside the appendix table to sum up the amounts
        $(this).find('table[name=table_appendix] > tbody > tr').each(function(index, appendix) {
            var attr = $(appendix).data('solved');
            if (typeof attr !== 'undefined' && attr !== false) {
                num_actions++;
            } else {
                num_comments++;
            }
        });

        // Iterates through all metadatas and updates the numbers
        $('#table_journal > tbody > tr[name=journal_entry_metadata][data-id=' + $(this).data('id') + '] > td').eq(5).text(num_comments);
        $('#table_journal > tbody > tr[name=journal_entry_metadata][data-id=' + $(this).data('id') + '] > td').eq(6).text(num_actions);
        // Need to update tablesorter because the table has updated 
        $('table[name=table_appendix]').trigger('update');
    });

}


// Display the journal 
function insertJournalTable() {
    var html = '';
    html += '<table id="table_journal" class="tablesorter_default">';
    html +=   '<thead>';
    html +=     '<tr class="tr_header">';
    html +=       '<th>No.</th>';
    html +=       '<th><span>Author</span></th>';
    html +=       '<th><span>Subject</span></th>';
    html +=       '<th><span>Event Time</span></th>';
    html +=       '<th><span>Class</span></th>';
    html +=       '<th><span>#Com</span></th>';
    html +=       '<th><span>#Act</span></th>';
    html +=       '<th nowrap><span>Added Time (Offset)</span></th>';
    html +=     '</tr>';
    html +=   '</thead>';
    html +=   '<tbody>';
    html +=   '</tbody>';
    html +=   '<tfoot>';
    html +=     '<tr class="tr_header">';
    html +=       '<td colspan="9">&nbsp;</td>';
    html +=     '</tr>';
    html +=   '</tfoot>';
    html += '</table>';
    
    $('#section_journal').append(html);
}

// Changes the background colour of actions according to deadline
function updateJournalActionsBg() {

    $('table[name=table_appendix] > tbody > tr').each(function() {
        
        var deadline = datetimeToTimestamp($(this).children('td').eq(3).text());
        var solved = $(this).data('solved');
        
        if (solved == 1) {
            $(this).css('background-color', '#5cb85c'); // success
        // If action is unsolved
        } else if (solved == 0) {
            // If the deadline of the action is in the past
            if (deadline < glob_local_timestamp) {
                $(this).css('background-color', '#d9534f'); // danger
            // If the deadline is within the next hour
            } else if (deadline < (glob_local_timestamp + cfg_actions_warning_time)) {
                $(this).css('background-color', '#f0ad4e'); // warning
            // If the deadline is due in over an hour
            } else {
                $(this).css('background-color', '#3276b1'); // primary
            }
        } else if (solved == -1) {
            $(this).css('text-decoration', 'line-through');
            $(this).css('background-color', 'none');
        }
    });
}

// Adds a post to the journal
function addDoc(db_name, obj_info, callback) {
    $.couch.db(db_name).saveDoc(obj_info, {
        success: function(data) {
            callback(data);
        },
        error: function(status) {
            console.log(status);
        }
    });
}

// Fetch and insert all comments into the journal
function getChangedJournalDocsComments(callback) {
    // The URL will fetch docs that is changed after last sequence number.
    var url = '/journal/_changes?filter=app/type&type=comment&since=' + getCookie('journal_comments_last_seq');

    // Could have used the couchdb plugin, but the second argument in changes() gets encoded, so it doesnt work.
    //$.couch.db("journal").changes(0, "?filter=app/type&type=JOR").onChange(function(data) {});
    $.getJSON(url, function(changes) {
        
        // Now we update the last sequence number, so we don't fetch old ones next time.
        document.cookie = 'journal_comments_last_seq=' + changes.last_seq;
        
        // Remove deleted docs
        function filterDeleted(element) {
            return element.deleted != true;
        } 
        
        // A new array with deleted docs filtered out
        var filtered_changes = changes.results.filter(filterDeleted);
        
        var i = 0;
        var len = filtered_changes.length;
                
        // If there is any changes, we continue
        if (len > 0) {
            // Iterates through all changed docs
            $.each(changes.results, function(index, item) {
                // Opens current doc
                $.couch.db('journal').openDoc(item.id, {
                    success: function(doc) {

                        insertJournalComment(doc);
                        $('table[name=table_appendix]').trigger('update');
                        
                        // When we have all currently new changes
                        if (++i == len) {
                            callback();
                        }
                    }
                });
            });
        } else {
            callback();
        }
    });
}

// Fetch and insert all actions into the journal
function getChangedJournalDocsActions(callback) {
    // The URL will fetch docs that is changed after last sequence number.
    var url = '/journal/_changes?filter=app/type&type=action&since=' + getCookie('journal_actions_last_seq');

    // Could have used the couchdb plugin, but the second argument in changes() gets encoded, so it doesnt work.
    //$.couch.db("journal").changes(0, "?filter=app/type&type=JOR").onChange(function(data) {});
    $.getJSON(url, function(changes) {
        
        // Now we update the last sequence number, so we don't fetch old ones next time.
        document.cookie = 'journal_actions_last_seq=' + changes.last_seq;
        
        // Remove deleted docs
        function filterDeleted(element) {
            return element.deleted != true;
        } 
        
        // A new array with deleted docs filtered out
        var filtered_changes = changes.results.filter(filterDeleted);
        
        var i = 0;
        var len = filtered_changes.length;
                
        // If there is any changes, we continue
        if (len > 0) {
            // Iterates through all changed docs
            $.each(changes.results, function(index, item) {
                // Opens current doc
                $.couch.db('journal').openDoc(item.id, {
                    success: function(doc) {

                        insertJournalAction(doc);
                        $('table[name=table_appendix]').trigger('update');
                        
                        // When we have all currently new changes
                        if (++i == len) {
                            callback();
                        }
                    }
                });
            });
        } else {
            callback();
        }
    });
}

// Fetch and insert all journal entry into the journal
function getChangedJournalDocs(callback) {
    var nr = 0;
    // The URL will fetch docs that is changed after last sequence number.
    var url = '/journal/_changes?filter=app/type&type=journal&since=' + getCookie('journal_last_seq');

    // Could have used the couchdb plugin, but the second argument in changes() gets encoded, so it doesnt work.
    //$.couch.db("journal").changes(0, "?filter=app/type&type=JOR").onChange(function(data) {});
    $.getJSON(url, function(changes) {
        
        // Now we update the last sequence number, so we don't fetch old ones next time.
        document.cookie = 'journal_last_seq=' + changes.last_seq;
        
        // Remove deleted docs
        function filterDeleted(element) {
            return element.deleted != true;
        } 
        
        // A new array with deleted docs filtered out
        var filtered_changes = changes.results.filter(filterDeleted);
        
        var i = 0;
        var len = filtered_changes.length;
                
        // If there is any changes, we continue
        if (len > 0) {
            // Iterates through all changed docs
            $.each(changes.results, function(index, item) {
                // Opens current doc
                $.couch.db('journal').openDoc(item.id, {
                    success: function(doc) {

                        insertJournalEntry(doc); 
                        $('table[name=table_appendix][data-id=' + doc._id + ']').tablesorter({selectorHeaders: '> thead > tr > th'});
                        
                        // When we have all currently new changes
                        if (++i == len) {
                            // We initialize tablesorter if it is not done before
                            if (typeof $('#table_journal')[0].config != 'object') {
                                $('#table_journal').tablesorter({selectorHeaders: '> thead > tr > th'});
                            }
                            callback();
                        }
                    }
                });
            });
        } else {
            callback();
        }
    });
}

function updateContent() {
    // We store the start time of the function to know if it has exeeded it's time limit
    var timestamp_start = (new Date()).getTime();
    
    getChangedJournalDocs(function() {
        getChangedJournalDocsComments(function() {
            getChangedJournalDocsActions(function() {
                var time_used = (new Date()).getTime() - timestamp_start;
                if (time_used < cfg_upd_journal_intval) {
                    setTimeout(updateContent, cfg_upd_journal_intval - time_used); 
                } else { 
                    updateContent();
                }
                console.log("Updated Content");
             });
         });
    });
}

// Collapses all action entries
function actionCollapseAll() {
    $('tr[name=action_entry_referer_header]').hide();
    $('tr[name=action_entry_referer]').hide();
    $('tr[name=action_entry_edit_header]').hide();
    $('tr[name=action_entry_edit]').hide();
}

function updateDoc(obj, callback) {
    $.couch.db('journal').saveDoc(obj, {
        success: function(doc) {
            callback(doc);
        }
    });
}

// Give the function the full classification name, and it will return the short name
function classReplacement(full_name) {
    for (key in cfg_classifications) {
        if (cfg_classifications.hasOwnProperty(key)) {
            if (cfg_classifications[key] == full_name) {
                return ucfirst(key.replace('_', ' '));
             }
         }
    
    }
}

$(document).ready(function() {

    // Initialize cookies for changes
    document.cookie = 'journal_last_seq=0';
    document.cookie = 'journal_comments_last_seq=0';
    document.cookie = 'journal_actions_last_seq=0';
    
    // Insert html structure
    insertJournalSection();
    insertJournalTable();
    
    // Set interval for updating content
    updateContent();
    //setInterval(updateContent, cfg_upd_journal_intval);
    
    // Set interval for updating the background for actions. 
    setInterval(updateJournalActionsBg, cfg_upd_actions_intval);

    // Set interval for updating the number of comments and actions of the journal entries
    setInterval(updateNumAppendices, cfg_upd_counters_intval);
    
    // Shows the journal
    showOnly('journal');
        
    // Show/hide appendices and content
    $(document).on('click', '.journal_view_header', function(e) {
        $id = $(this).data('id');
        $('tr[name=journal_entry_content][data-id=' + $id + ']').toggle();
        $('table[name=table_appendix][data-id=' + $id + ']').toggle();
        $('table[name=table_appendix_form][data-id=' + $id + ']').toggle();
    });

    $(document).on('click', '#add_journal_class_select > li', function(e) {
        e.preventDefault();
        var selected = $(this).text();
        $('#add_journal_class').val(selected);
        $('#add_journal_class_label').html(selected);
    });

    $(document).on('click', '#footer_toggle', function(e) {
        e.preventDefault();
        console.log($('#footer_bot').slideToggle('fast'));
        $('#footer').css('height', 'auto');
    });
    
    $(document).on('focus', '#add_journal_event_time', function() {
        $(this).val(moment(glob_local_timestamp).format('YYYY/MM/DD HH:mm:ss ZZ'));
        $(this).datetimepicker({format: 'YYYY/MM/DD HH:mm:ss ZZ', language: 'gb'});
    });
    
    $(document).on('focus', '#add_appendix_deadline', function() {
        $(this).val(moment(glob_local_timestamp).format('YYYY/MM/DD HH:mm:ss ZZ'));
        $(this).datetimepicker({format: 'YYYY/MM/DD HH:mm:ss ZZ', language: 'gb'});
    });
    
    $(document).on('change', '#add_appendix_type', function() {
        var id = $(this).data('id');
        $('div[name=add_appendix_type_action][data-id=' + id + ']').toggle();
        $('div[name=add_appendix_type_comment][data-id=' + id + ']').toggle();
        $('input[name=appendix_submit_button][data-id=' + id + ']').val('Add ' + $(this).val());
    });
    
    // Add a new journal entry
    $(document).on('click', '#add_journal_btn', function(e) {
        e.preventDefault();
        
        document.cookie = 'order_counter=' + getCookie('order_counter') + 1;
        
        var obj_info = {
            subject: $('#add_journal_subject').val(),
            content: $('#add_journal_cont').val(),
            author: getCookie('username'),
            classification: ($('#add_journal_class').val() != ''? $('#add_journal_class').val() : cfg_classifications['internal']),
            type: 'journal',
            event_time: datetimeToTimestamp($('#add_journal_event_time').val()),
            added_timestamp_external: glob_external_timestamp,
            added_timestamp_local: glob_local_timestamp,
            keywords: $('#add_journal_keywords').val(),
            uuid: glob_uuid,
            order: getCookie('order_counter'),
        }
        
        // Check if the event time is a valid time
        if (!validDate(obj_info.event_time)) {
            return;
        }   
        
        // Clears the new journal entry form
        addDoc('journal', obj_info, function(doc) {
            $('#add_journal_subject').val('');
            $('#add_journal_cont').val('');
            $('#add_journal_event_time').val('');
            $('#add_journal_keywords').val('');
            $('#add_journal_class_label').val(cfg_classifications['internal']);
            $('#add_journal_class').val(cfg_classifications['internal']);
        });
    });


    // Add a new appendix
    $(document).on('submit', '.add_appendix', function(e) {
        // Prevent submit because we will use ajaxSubmit() to actually send the attachment to CouchDB.
        e.preventDefault();
        
        // A small hack to retrieve the objects (the form) initial state. 
        //  $(this) would change value inside openDoc()
        var self = $(this);
        
        // Checking if the user will upload attachment or not
        if ($(self.find('#_attachments')[0]).val() != '') {
            // Check whether browser fully supports all File API
            if (window.File && window.FileReader && window.FileList && window.Blob) {
                // Get the file size and name from file input field
                var fsize = self.find('#_attachments')[0].files[0].size;
                var fname = self.find('#_attachments')[0].files[0].name;
            
                // If the file is too big, we let the user know and we return
                if (fsize > cfg_filesize_limit) {
                    var msg = "The attached file: " + fname + " is too big. (" + (fsize / (1024 * 1024)).toFixed(2) + " MB)\n";
                        msg += "Limit: " + (cfg_filesize_limit / (1024 * 1024)) + " MB";
                    // Displays alert message
                    alertMsg(msg);
                    // Empty the browse file option
                    self.find('#add_attachment_filename_label').val('');
                    self.find('#_attachments').val('');
                    return;
                }
            } else {
                alertMsg("Your browser does not support file upload.");
            }
        }

        // Increments the order cookie variables
        document.cookie = 'order_counter=' + getCookie('order_counter') + 1;
        
        // Adding the document with basic information before we upload any attachments.
        var obj_info = {
            refers_to: self.children('#add_appendix_refers_to').val(),
            content: self.find('#add_appendix_cont').val(),
            author: getCookie('username'),
            type: self.find('#add_appendix_type').val(),
            added_timestamp_external: glob_external_timestamp,
            added_timestamp_local: glob_local_timestamp,
            uuid: glob_uuid,
            order: getCookie('order_counter'),
        }

        // If the appendix is an action, we add some more data
        if (self.find('#add_appendix_type').val() == 'action') {
            obj_info['deadline'] = datetimeToTimestamp(self.find('#add_appendix_deadline').val());
            obj_info['solved'] = 0;
            obj_info['solved_by_username'] = null;
            obj_info['responsible'] = self.find('#add_appendix_responsible').val();
        }
        
        // Check if the deadline entered is a valid time
        if (!validDate(obj_info.deadline)) {
            return;
        }   

        // Checks if the user want to use ZEN code instead of uploading an attachment.
        if (self.find('#add_appendix_use_filed_copy').prop('checked') == true && self.find('#_attachments').val() == '') {
             /* Adds the zen code to the doc to be uploaded. */
             obj_info['filed_copy'] = self.find('#add_appendix_filed_copy').val();
        }

        // Get the database name
        var input_db = self.find('input[name="_db"]').val();

        // Creates the comment as a new entry
        $.couch.db(input_db).saveDoc(obj_info, {
            success: function(response) {
                // Now that the Couch Doc exists, so we can submit the attachment,
                // but before submitting we have to define the revision of the doc
                //   so that it gets passed along in the form submit.
                self.find('input[name="_rev"]').val(response.rev);
                self.find('input[name="_id"]').val(response.id);
                
                // If the user wanted to use filed copy code instead, we don't submit the attachment.
                if (obj_info.filed_copy != '') {
                    self.ajaxSubmit({
                        // Submit the form with the attachment
                        url: '/' + input_db + '/' + response.id,
                        success: function(response) {
                            // Clear form
                            self.find('#add_appendix_cont').val('');
                            self.children('#add_appendix_cont').val('');
                            self.find('#add_appendix_deadline').val('');
                            self.find('#add_appendix_filed_copy').val(randStr(5));
                            self.find('#add_appendix_use_filed_copy').prop('checked', false);
                            self.find('#_attachments').val('');
                            self.find('#add_attachment_filename_label').val('');
                            self.find('#add_appendix_responsible').val('');
                        }
                    });
                }
            }
        });
    });
    
    
    // Search for metadata, content and appendix based on string search
    // Based on: http://stackoverflow.com/questions/9127498/how-to-perform-a-real-time-search-and-filter-on-a-html-table
    $(document).on('keyup', '#search_str', function() {
        // Create regexp pattern
        var val = '^(?=.*' + $.trim($(this).val()).split(/\s+/).join(')(?=.*') + ').*$';
        var reg = RegExp(val, 'i');

        // Iterate through all journal entry metadata and content
        var $rows = $('tr[name=journal_entry_metadata]');
        $.each($rows, function() {
            var metadata_text = $(this).text().replace(/\s+/g, ' ');
            var content_text = $('tr[name=journal_entry_content][data-id=' + $(this).data('id') + ']').text().replace(/\s+/g, ' ');
            // Checking if search matched against metadata and content
            if (reg.test(metadata_text) || reg.test(content_text)) {
                // Display content
                $('tr[name=journal_entry_content][data-id=' + $(this).data('id') + ']').show();
                // Display appendices
                $('tr[name=journal_entry_appendices][data-id=' + $(this).data('id') + ']').show();
                // Display appendix form
                $('tr[name=journal_entry_appendix_form][data-id=' + $(this).data('id') + ']').show();
                // Display metadata
                $(this).show();
            } else {
                // We only hide rows if we dont do a keyword search
                $('tr[name=journal_entry_content][data-id=' + $(this).data('id') + ']').hide();
                // Hide appendices
                $('tr[name=journal_entry_appendices][data-id=' + $(this).data('id') + ']').hide();
                // Hide appendix form
                $('tr[name=journal_entry_appendix_form][data-id=' + $(this).data('id') + ']').hide();
                $(this).hide();
            }
        });

        // Iterate through all appendices
        var $rows = $('tr[name=journal_entry_appendices]');
        $.each($rows, function() {
            var text = $(this).text().replace(/\s+/g, ' ');
            // Checking if search matched against appendices
            if (reg.test(text)) {
                // Display metadata
                $('tr[name=journal_entry_metadata][data-id=' + $(this).data('id') + ']').show();
                // Display content
                $('tr[name=journal_entry_content][data-id=' + $(this).data('id') + ']').show();
                // Display appendix form
                $('tr[name=journal_entry_appendix_form][data-id=' + $(this).data('id') + ']').show();
                // Display appendices
                $(this).show();
            }
        });

    });
   
    // Trigger search when clicking on time filter input boxes
    $(document).on('focus', '#search_time_from, #search_time_to', function() {
        // If there is already text in the input, we dont insert new time
        if ($(this).val() == '') {
            $(this).val(moment(glob_local_timestamp).format('YYYY/MM/DD HH:mm:ss ZZ'));
            $(this).datetimepicker({format: 'YYYY/MM/DD HH:mm:ss ZZ', language: 'gb'});
        }
        // Trigger the search feature
        $(this).trigger('keyup');
    });
    
    // Trigger search when clicking on the search string input box
    $(document).on('focus', '#search_str', function() {
        $(this).trigger('keyup');
    });
    
    // Clears the search input by setting the value to '' and calling keyup to reset the search value
    $(document).on('click', '#search_str_clear', function(e) {
        e.preventDefault();
        $('#search_str').val('');
        $('#search_str').trigger('keyup');
    });
    
    // Clears the time filter input by setting the value to '' and calling keyup to reset the filter value
    $(document).on('click', '#search_time_to_clear', function(e) {
        e.preventDefault();
        $('#search_time_to').val('');
        $('#search_time_to').trigger('keyup');
    });

    // Clears the time filter input by setting the value to '' and calling keyup to reset the filter value
    $(document).on('click', '#search_time_from_clear', function(e) {
        e.preventDefault();
        $('#search_time_from').val('');
        $('#search_time_from').trigger('keyup');
    });
    
    // Search for metadata, content and appendix based on datetime search
    $(document).on('keyup', '#search_time_from, #search_time_to', function() {
        var time_from = new Date($('#search_time_from').val()).getTime();
        var time_to = new Date($('#search_time_to').val()).getTime(); 
        var $rows = $('tr[name=journal_entry_metadata]');
        
        // Iterate through all journal entries
        $.each($rows, function() {
            // Gets event time
            var time_target = datetimeToTimestamp($(this).children('td').eq(3).text());
            // If the target time is earlier then the from time and past the to time, we hide it.
            if (time_target <= time_from || time_target >= time_to) {
                // Hide metadata, appendices and content
                $(this).hide();
                $('tr[name=journal_entry_appendices][data-id=' + $(this).data('id') + ']').hide();
                $('tr[name=journal_entry_appendix_form][data-id=' + $(this).data('id') + ']').hide();
                //$('tr[name=journal_entry_content][data-id=' + $(this).data('id') + ']').hide();
            } else {
                // Show metadata, appendices and content
                // We only show rows again if we are not performing a time filter
                $(this).show();
                $('tr[name=journal_entry_appendix_form][data-id=' + $(this).data('id') + ']').show();
                $('tr[name=journal_entry_appendices][data-id=' + $(this).data('id') + ']').show();
                //$('tr[name=journal_entry_content][data-id=' + $(this).data('id') + ']').show();
            }
        });
        
        // Iterate through all appendices
        var $rows = $('tr[name=journal_entry_appendices] > td > table > tbody > tr');
        $.each($rows, function() {
            // Gets added local time
            var time_target = datetimeToTimestamp($(this).children('td').eq(5).text());
            // If the target time is earlier then the from time and past the to time, we hide it.
            if (time_target <= time_from || time_target >= time_to) {
                $(this).hide();
            } else {
                // Display metadata
                $('tr[name=journal_entry_metadata][data-id=' + $(this).data('id') + ']').show();
                // Display content
                $('tr[name=journal_entry_content][data-id=' + $(this).data('id') + ']').show();
                // Display appendices
                $(this).show();
            }
        });
        
    });
    
    // Goto action and expand the target action entry.
    $(document).on('click', 'a[name=journal_entry_goto_action]', function(e) {
        e.preventDefault();
        actionCollapseAll();
        showOnly('actions');
        $('tr[name=action_entry][data-id=' + $(this).data('id') + ']').trigger('click');
    });
    
});

 
