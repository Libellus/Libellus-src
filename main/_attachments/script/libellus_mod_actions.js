var glob_actions_counter = 0;

function insertActionsSection() {
    $('<div id="section_actions" style="display: none;"></div>').appendTo('#main_content');
}

function insertActionsTable() {
    var html = '';
    html += '<table id="table_actions" class="tablesorter_default">';
    html +=   '<thead>';
    html +=     '<tr class="tr_header">';
    html +=       '<th>Nr.</th>';
    html +=       '<th><span>Author</span></th>';
    html +=       '<th><span>Subject</span></th>';
    html +=       '<th><span>Deadline</span></th>';
    html +=       '<th><span>Responsible</span></th>';
    html +=       '<th><span>Marked solved by</span></th>';
    html +=       '<th><span>Status</span></th>';
    html +=     '</tr>';
    html +=   '</thead>';
    html +=   '<tbody>';
    html +=   '</tbody>';
    html +=   '<tfoot>';
    html +=     '<tr class="tr_header">';
    html +=       '<td colspan="7">&nbsp;</td>';
    html +=     '</tr>';
    html +=   '</tfoot>';
    html += '</table>';
    $('#section_actions').append(html);
}

// Removes duplicates in actions
function removeActionsDuplicates(action_id) {
    $('#table_actions .actions_view_header').each(function(index, item) {
        if (action_id == $(item).data('id')) {
            $('#table_actions tr[name=action_entry][data-id=' + $(item).data('id') + ']').remove();
            $('#table_actions tr[name=action_entry_referer_header][data-id=' + $(item).data('id') + ']').remove();
            $('#table_actions tr[name=action_entry_referer][data-id=' + $(item).data('id') + ']').remove();
            $('#table_actions tr[name=action_entry_show_comment_header][data-id=' + $(item).data('id') + ']').remove();
            $('#table_actions tr[name=action_entry_show_comment][data-id=' + $(item).data('id') + ']').remove();
            $('#table_actions tr[name=action_entry_edit_header][data-id=' + $(item).data('id') + ']').remove();
            $('#table_actions tr[name=action_entry_edit][data-id=' + $(item).data('id') + ']').remove();
        }
    });
}

// Inserts an action into the actions view
function insertActionsEntry(action_doc, journal_doc) {

    var html = '';
    html += '<tr name="action_entry" class="row-vm actions_view_header" data-solved="' + action_doc.solved + '" data-id="' + action_doc._id + '">';
    html +=   '<td>' + ++glob_actions_counter + '</td>';
    html +=   '<td>' + escapeHtml(action_doc.author) + '</td>';
    html +=   '<td>' + escapeHtml(action_doc.content) + '</td>';
    html +=   '<td>' + moment(action_doc.added_timestamp_local).format('YYYY/MM/DD HH:mm:ss ZZ') + '</td>';
    html +=   '<td>' + (action_doc.responsible == null? '&nbsp;' : action_doc.responsible) + '</td>';
    html +=   '<td>' + (action_doc.solved_by_username == null? '&nbsp;' : action_doc.solved_by_username) + '</td>';

    // Button for marking action as solved
    html +=   '<td>';
    html +=     '<button name="action_solved_status" type="button" class="btn btn-primary">Solved</button>';
    html +=   '</td>';
    html += '</tr>';
    
    html += '<tr name="action_entry_referer_header" class="row-details expand-child" data-id="' + action_doc._id + '">';
    html +=   '<td colspan="7">Journal Entry</td>';
    html += '</tr>';
    
    html += '<tr name="action_entry_referer" class="row-details expand-child" data-id="' + action_doc._id + '">';
    html +=   '<td>&nbsp;</td>';
    html +=   '<td>' + escapeHtml(journal_doc.author) + '</td>';
    html +=   '<td>' +  wordwrap(escapeHtml(journal_doc.subject), 60, '<br />', 1) + '</td>';
    html +=   '<td colspan="3">' + wordwrap(escapeHtml(journal_doc.content), 60, '<br />', 1) + '</td>';
    html +=   '<td><a href="#" name="action_entry_goto_journal" data-id="' + journal_doc._id + '">';
    html +=     '<span style="color:#333333;" class="glyphicon glyphicon-hand-left"></span></a>';
    html +=   '</td>';
    html += '</tr>';

    // We show the form if the action is not solved
    if (action_doc.solved == 0) {
        
        html += '<tr name="action_entry_edit_header" class="row-details expand-child" data-id="' + action_doc._id + '">';
        html +=   '<td colspan="7">Edit Action</td>';
        html += '</tr>';
        
        html += '<tr name="action_entry_edit" class="row-details expand-child"  data-id="' + action_doc._id + '">';
        html +=   '<td colspan="7">';
        html +=     '<div class="input-group col-md-8" style="margin-top:1%; margin-bottom:1%;">';
        html +=       '<input name="action_entry_edit_comment" placeholder="Comment" type="text" class="form-control" data-id="' + action_doc._id + '" />';
        html +=       '<div class="input-group-btn">';
        html +=         '<div class="dropdown">';
        html +=           '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">';
        html +=             '<span name="action_entry_edit_status_label" style="color:#333333;" data-id="' + action_doc._id + '">Status</span> <span class="caret"></span>';
        html +=           '</button>';
        html +=           '<ul name="action_entry_edit_status_select" class="dropdown-menu" style="" data-id="' + action_doc._id + '">';
        html +=             '<li><a href="#">Solved</a></li>';
        html +=             '<li><a href="#">Rejected</a></li>';
        html +=           '</ul>';
        html +=         '</div>';
        html +=         '<input name="action_entry_edit_status_value" data-id="' + action_doc._id + '" type="hidden">';
        html +=       '</div>';
        html +=     '</div>';
        html +=     '<div style="margin-top:1%; margin-bottom:1%;">';
        html +=       '<button name="action_entry_edit_btn" class="btn btn-secondary col-md-1" type="submit" data-id="' + action_doc._id + '">Update</button>';
        html +=     '</div>';
        html +=   '</td>';
        html += '</tr>';

    // If it's solved, we display the comment
    } else {
        html += '<tr name="action_entry_show_comment_header" class="row-details expand-child" data-id="' + action_doc._id + '">';
        html +=   '<td colspan="7">Comment</td>';
        html += '</tr>';
        html += '<tr name="action_entry_show_comment" class="row-details expand-child" data-id="' + action_doc._id + '">';
        html +=   '<td colspan="7" style="text-align:center; padding-top:1%; padding-bottom:1%;">';
        html +=     '<em>Marked and commented at <strong>' +  moment(action_doc.solved_timestamp).format('YYYY/MM/DD HH:mm:ss ZZ') + '</strong> by <strong>';
        html +=       escapeHtml(action_doc.solved_by_username) + '</strong></em><br />' + escapeHtml(action_doc.comment);
        html +=   '</td>';
        html += '</tr>';
    }
    
    $('#table_actions > tbody').append(html);
}

function getChangedActionDocs() {
    var url = '/journal/_changes?filter=app/type&type=action&since=' + getCookie('actions_last_seq');
    
    // We store the start time of the function to know if it has exeeded it's time limit
    var timestamp_start = (new Date()).getTime();

    // Could have used this, but the second argument in changes() gets encoded, so it doesnt work.
    //$.couch.db("journal").changes(0, "?filter=app/type&type=JOR").onChange(function(data) {});
    $.getJSON(url, function(changes) {
        
        // Now we update the last sequence number, so we don't fetch old ones next time.
        document.cookie = 'actions_last_seq=' + changes.last_seq;
        
        // Remove deleted docs
        function filterDeleted(element) {
            return element.deleted != true;
        } 
        
        // A new array with deleted docs filtered out
        var filtered_changes = changes.results.filter(filterDeleted);

        var i = 0;
        var len = filtered_changes.length;
        
        // Are there any new changes?
        if (len > 0) {
            $.each(changes.results, function(index, item) {
                $.couch.db('journal').openDoc(item.id, {
                    success: function(act) {
                        $.couch.db('journal').openDoc(act.refers_to, {
                            success: function(jor) {
                                insertActionsEntry(act, jor);
                                // When we have all currently new changes
                                if (++i == len) {
                                    // Update tablesorter
                                    $('#table_actions').trigger('update');
                                    // If the request has succeeded its time interval, then we call it again right away,
                                    //  if not, then we call it again when it should according to its time frame. 
                                    var time_used = (new Date()).getTime() - timestamp_start;
                                    if (time_used < cfg_upd_actions_intval) {
                                        setTimeout(getChangedActionDocs, cfg_upd_actions_intval - time_used); 
                                    } else { 
                                        getChangedActionDocs();
                                    }
                                }
                            }
                        });
                    }
                });
            });
        } else {
            var time_used = (new Date()).getTime() - timestamp_start;
            if (time_used < cfg_upd_actions_intval) {
                setTimeout(getChangedActionDocs, cfg_upd_actions_intval - time_used); 
            } else { 
                getChangedActionDocs();
            }
        }                            
    });
    $('#table_actions').trigger('update');
}

// Changes the background color of actions according to deadline
function updateActionsBg() {
    $('#table_actions > tbody > tr[name=action_entry]').each(function() {

        var deadline = datetimeToTimestamp($(this).children('td').eq(3).text());
        var solved = $(this).data('solved');

        // If action is solved
        if (solved == 1) {
            $(this).find('button[name=action_solved_status]').removeClass('btn-danger btn-warning btn-primary btn-invalid').addClass('btn-success').text('Solved');
        // If action is unsolved
        } else if (solved == 0) {
            // If the deadline of the action is in the past 
            if (deadline < glob_local_timestamp) {
                $(this).find('button[name=action_solved_status]').removeClass('btn-success btn-warning btn-primary btn-invalid').addClass('btn-danger').text('Unsolved');
            // If the deadline is within the next hour
            } else if (deadline < (glob_local_timestamp + cfg_actions_warning_time)) {
                $(this).find('button[name=action_solved_status]').removeClass('btn-success btn-danger btn-primary btn-invalid').addClass('btn-warning').text('Unsolved');
            // If the deadline is due in over an hour
            } else {
                $(this).find('button[name=action_solved_status]').removeClass('btn-success btn-danger btn-warning btn-invalid').addClass('btn-primary').text('Unsolved');
            }
        // If action is unsolvable
        } else if (solved == -1) {
            $(this).find('button[name=action_solved_status]').removeClass('btn-success btn-danger btn-primary btn-warning').addClass('btn-invalid').text('Rejected');
        }
    });
}

// Search database after a specifiec doc and returns it
function getDoc(type, target_id, callback) {
    $.couch.db('journal').view('filter/' + type, {
        success: function(data) {
            for (var i = 0; i < data.total_rows; i++) {
                if (data.rows[i].id == target_id) {
                    $.couch.db('journal').openDoc(data.rows[i].id, {
                        success: function(doc) {
                            console.log("from getDoc()");
                            console.log(doc);
                            callback(doc);
                        }
                    });
                }
            }
        },
        reduce: false
    });
}

// Collapses all journal entries
function journalCollapseAll() {
    $('table[name=table_appendix]').hide();
    $('table[name=table_appendix_form]').hide();
}

$(document).ready(function() {

    document.cookie = 'actions_last_seq=0';

    insertActionsSection();
    insertActionsTable();
    
    $('#table_actions').tablesorter({selectorHeaders: '> thead > tr > th'});
    
    getChangedActionDocs();

    // Set interval for updating the background for actions. 
    setInterval(updateActionsBg, cfg_upd_actions_intval);
    
    // Show/hide appendices
    $(document).on('click', '.actions_view_header', function(e) {
        var id = $(this).data('id');
        $('tr[name=action_entry_referer][data-id=' + id + ']').toggle();
        $('tr[name=action_entry_edit][data-id=' + id + ']').toggle();
        $('tr[name=action_entry_referer_header][data-id=' + id + ']').toggle();
        $('tr[name=action_entry_edit_header][data-id=' + id + ']').toggle();
        $('tr[name=action_entry_show_comment_header][data-id=' + id + ']').toggle();
        $('tr[name=action_entry_show_comment][data-id=' + id + ']').toggle();
    });

		$(document).on('click', 'ul[name=action_entry_edit_status_select].dropdown-menu > li', function(e) {
        e.preventDefault();
        var text = $(this).text();
        var id = $(this).parent('ul').data('id');
        $('input[name=action_entry_edit_status_value][data-id=' + id + ']').val(text);
        $('span[name=action_entry_edit_status_label][data-id=' + id + ']').html(text);
    });


    // Updates the action to solved
    $(document).on('click', 'button[name=action_entry_edit_btn]', function(e) {
        e.preventDefault();
        var $id = $(this).data('id');
        
        getDoc('action', $id, function(doc) {
            
            var solved_value = $('input[name=action_entry_edit_status_value][data-id=' + $id + ']').val();
            var comment = $('input[name=action_entry_edit_comment][data-id=' + $id + ']').val();
            
            if (doc['solved'] == 0) {
                doc['comment'] = comment;
                if (solved_value == 'Solved') {
                    doc['solved'] = 1;
                } else if (solved_value == 'Rejected') {
                    doc['solved'] = -1;
                }
                
                document.cookie = 'order_counter=' + getCookie('order_counter') + 1;
                
                doc['solved_by_username'] = getCookie('username');
                doc['solved_timestamp'] = glob_local_timestamp;
                doc['solved_by_uuid'] = glob_uuid;
                doc['order'] = getCookie('order_counter');
                
                updateDoc(doc, function(doc) {
                    console.log(doc);
                    // We need to remove the duplicates inserted when solving an action.
                    //  This is because changes will fetch the action again.
                    console.log("calling removeActuonsDUp with id: " + doc.id);
                    removeActionsDuplicates(doc.id);
                });
            }
        });
    });
    
    // Goto journal and expand the target journal entry.
    $(document).on('click', 'a[name=action_entry_goto_journal]', function(e) {
        e.preventDefault();
        journalCollapseAll();
        showOnly('journal');
        $('tr[name=journal_entry_metadata][data-id=' + $(this).data('id') + ']').trigger('click');
    });

});


