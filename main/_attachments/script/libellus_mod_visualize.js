function insertVisualizeSection() {
    $('<div id="section_visualize" style="display: none;"></div>').appendTo('#main_content');
}

// Display visualize
function insertVisualizeDivision() {

    var html = '';
    html += '<button id="zoom_in_btn" class="btn btn-secondary" title="Zoom in" onclick="zoom(0.4);"><i class="glyphicon glyphicon-zoom-in"></i></button>';
    html += '<button id="zoom_out_btn" class="btn btn-secondary" title="Zoom out" onclick="zoom(-0.4);"><i class="glyphicon glyphicon-zoom-out"></i></button>';
    html += '<button id="move_left_btn" class="btn btn-secondary" title="Move left" onclick="move(-0.2);"><i class="glyphicon glyphicon-chevron-left"></i></button>';
    html += '<button id="move_right_btn" class="btn btn-secondary" title="Move right" onclick="move(0.2);"><i class="glyphicon glyphicon-chevron-right"></i></button>';
    html += '<input type="button" class="btn btn-secondary" value="Adjust to visible range" title="Adjust visible range to accommodate all events" onclick="adjust();">'
    html += '<input type="button" class="btn btn-secondary" value="Move to current time" title="Move to current time" onclick="moveToCurrentTime();">';
    html += '<div id="timeline"></div>';

    $('#section_visualize').append(html);
    
}

var timeline;

function getSelectedRow() {
    var row = undefined;
    var sel = timeline.getSelection();
    if (sel.length) {
        if (sel[0].row != undefined) {
            row = sel[0].row;
        }
    }
    return row;
}


// Displays the timeline
function drawVisualization() {
    var timeline_content = [];
    // Uses a filter to get all documents except design
    $.getJSON('/journal/_design/filter/_view/all', function(data) {
        for (number in data.rows) {
            // If the type is of journal, we display it as boxes
            if (data.rows[number].value.type == 'journal') {
                var content = escapeHtml(data.rows[number].value.subject);
                // If happening time is entered we uses this as the timeline time
                if (data.rows[number].value.happening_time) {
                var date = (data.rows[number].value.happening_time);
                } else {
                // Else the timestamp for when the document was added to the database is used
                var date = (data.rows[number].value.added_timestamp_local);
                }
                // Creates the object with the wanted data
                var obj = {
                    'start': new Date(date),
                //    'end': new Date(2014,8,1),
                    'content': content,
                    'className': 'timeline-journalpost'
                };
                timeline_content.push(obj);
            // If the the type is of action, we display it as a rectangle
            } else if (data.rows[number].value.type == 'action') {
                var content = escapeHtml(data.rows[number].value.content);
                // Start time is when the action was created
                var start = (data.rows[number].value.added_timestamp_local);
                // The ending is when the action is supposed to be solved.
                var deadline = (data.rows[number].value.deadline);       
                
                // Adds the same colour to the timeline as in actions
                var timecolour;
                if (data.rows[number].value.solved == '1') {
                    timecolour = 'timeline-solved';
                } else if (data.rows[number].value.solved == '0') {
                    if (deadline < glob_local_timestamp) {
                        timecolour = 'timeline-danger';
                    } else if (deadline < (glob_local_timestamp + cfg_actions_warning_time)) {
                        timecolour = 'timeline-warning';
                    } else {
                        timecolour = 'timeline-primary';
                    }
                } else if (data.rows[number].value.solved == '-1') {
                    timecolour = 'timeline-invalid';
                }
                
                var obj = {
                    'start': new Date(start),
                    'end': new Date(deadline),
                    'content': "<b>Action</b>:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + content,
                    'className': timecolour,
                };
                timeline_content.push(obj);
            }
            
        }

        // Options for the timeline
        var options = {
            'width':  '100%',
            'height': 'auto',
            //'height': '150%',
            'editable': false,
            'style': 'box',
            // 'axisOnTop': true,
            'cluster': true
        };

        // Instantiate the timeline object.
        timeline = new links.Timeline(document.getElementById("timeline"));
   
        
        links.events.addListener(timeline, 'select', onselect);
        
        // Draw the timeline with the timeline_content and options
        timeline.draw(timeline_content, options);
        
    });

}


// Zoom out/in
function zoom(zoomVal) {
    timeline.zoom(zoomVal);
    timeline.trigger("rangechange");
    timeline.trigger("rangechanged");
}


// Adjusts the timeline, such that all elements are visible.
function adjust() {
    timeline.setVisibleChartRangeAuto();
}


// Move left/right
function move(moveVal) {
    timeline.move(moveVal);
    timeline.trigger("rangechange");
    timeline.trigger("rangechanged");
}


// Sets the current time in the center of the timeline.
function moveToCurrentTime() {
    timeline.setVisibleChartRangeNow();
}

function redraw() {
    timeline.redraw();
}



// http://www.w3.org/2002/09/tests/keys.html
// Enables the usage of keys to operate the timeline
function checkKey(e) {
    e = e || window.event;

    if (e.keyCode == '37') {
        move(-0.2);
    }
    else if (e.keyCode == '39') {
        move(0.2);
    }
    else if (e.keyCode == '109') {
        zoom(-0.4);
    }
    else if (e.keyCode == '107') {
        zoom(0.4);
    }
    else if (e.keyCode == '36') {
        moveToCurrentTime();
    }
}

jQuery(function($){
    var windowWidth = $(window).width()
    $(window).resize(function() {
        if(windowWidth != $(window).width()){
            timeline.checkResize();
            return;
        }
    });
});
        
$(document).ready(function() {
    
    insertVisualizeSection();
    insertVisualizeDivision();

    drawVisualization();
    setInterval(redraw, 1000);
    document.onkeydown = checkKey;

});
