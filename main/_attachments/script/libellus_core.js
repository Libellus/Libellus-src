// Global variables
var glob_local_timestamp;       // Interal timestamp from clients computer clock
var glob_prev_local_timestamp;  // The previous local time. Used to check if the local time was changed
var glob_external_timestamp;    // External timestamp from the Internet
var glob_uuid;                  // A global unique identifier to the client
var glob_order_counter;         // Keeps track of which order the client performs tasks in. Will increment every time the client insert data to the db.

// If the local time changes, we put a note in the database about it
function logTimeChange() {
    // If we know the last timestamp
    if (glob_prev_local_timestamp) {
        // If the current timestamp differs by over 3000 ms since the last timestamp
        var diff = glob_prev_local_timestamp - glob_local_timestamp;
        if (Math.abs(diff) > 3000) {
            var obj_info = {};
            obj_info['prev_local_timestamp'] = glob_prev_local_timestamp;
            obj_info['new_local_timestamp'] = glob_local_timestamp;
            obj_info['diff'] = diff;
            obj_info['current_external_timestamp'] = glob_external_timestamp;
            obj_info['username'] = getCookie('username');
            obj_info['uuid'] = glob_uuid;
          
            addDoc('timewatch', obj_info, function(doc) {
                console.log("Added time change:");
                console.log(doc);
            });
        }
    }
    glob_prev_local_timestamp = glob_local_timestamp;
}

/*
// This function will monitor if the client got external time from not having it. i.e got Internet connection. 
function timeGotExternal() {
    if (isNumber(getCookie('initiated_external_timestamp'))) {
        if (!glob_external_timestamp && glob_local_timestamp) {
            setExternalTimestamp();
        }
    }
}
*/

// Updates all entries that does not have external timestamp and sets it according to the local/external offset. 
function setExternalTimestamps() {
    // Iterates through all journal and appendix docs
    $('#table_journal > tbody > tr[name=journal_entry_metadata], table[name=table_appendix] > tbody > tr').each(function(k, v) {
       // Opens the current doc
       $.couch.db('journal').openDoc($(this).data('id'), {
          success: function(doc) {
              // Only change docs that doesn't have external time
              if (doc.added_timestamp_external == null && glob_external_timestamp) {
                  doc['_id'] = doc._id;
                  doc['_rev'] = doc._rev;
                  // Calculates the offset
                  var offset = getTimeOffset();
                  doc.added_timestamp_external = doc.added_timestamp_local + offset;
                  updateDoc(doc, function(resp) {
                      console.log(resp);
                  });
              }
          }
       });
    });
}

// Initiates the external timestamp.
// This function should be called every minute or so to correct the time. 
// updateExternalTimestamp() should be the function to increment the time so save bandwith.
// Had to first use $.ajax, and then $.getJSON to get this to work, or it didn't run the second request.
function initExternalTimestamp() {
    $.getJSON("https://ojeey.pw/libellus/gettime.php?callback=?", function(data) {
         glob_external_timestamp = datetimeToTimestamp(data.dateString);
         console.log('Updated external timestamp from first source.');
    }).fail(function() {
        $.getJSON("https://timeapi.herokuapp.com/utc/now.json?callback=?", function(data) {
            glob_external_timestamp = datetimeToTimestamp(data.dateString);
            console.log('Updated external timestamp from second source.');
        });
    });
}

// Returns the difference between local and external time
function getTimeOffset() {
    return glob_external_timestamp - glob_local_timestamp;
}

function updateAllTimes() {
    updateExternalTimestamp();
    updateLocalTimestamp();
    updateClockStatus();
    logTimeChange();
}

// Extracts cookie information
function getCookie(key) {
    var name = key + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i].trim();
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return '';
}

// Extracts location hash information
function getLocationHash(key) {
    var hash = window.location.hash.substr(1);
    return hash.substr(hash.indexOf(key)).split('&')[0].split('=')[1];
}

// Changes the color if the clock status.
function updateClockStatus() {
    var diff = Math.abs(getTimeOffset());

    if (!glob_external_timestamp) {
        $('#clock_status').css('background-color', 'red');
    } else if (diff < cfg_time_limit_ok) {
        $('#clock_status').css('background-color', '#00FF2A');
    } else if (diff < cfg_time_limit_warning) {
        $('#clock_status').css('background-color', 'yellow');
    } else {
        $('#clock_status').css('background-color', '#FF6200');
    }
    $('#clock_status').attr('title', 'Offset: ' + (diff / 1000) + ' Sec');
}

// Updates the hidden external timestamp element and updates the visible external clock in right corner
function updateExternalTimestamp() {
    if (glob_external_timestamp) {
        glob_external_timestamp = parseInt(glob_external_timestamp) + 1000;
        var internet_time = moment(glob_external_timestamp).zone('+0000').format('YYYY/MM/DD HH:mm:ss ZZ');
        // $('#clock_external').html('<span style="color:#FFFFFF; font-weight:bold;">Internet Time:</span> ' + timestampToDatetime(glob_external_timestamp));
        $('#clock_external').html('<span style="color:#FFFFFF; font-weight:bold;">Internet:</span> ' + internet_time);
    } else {
        $('#clock_external').html('<span style="color:#FFFFFF; font-weight:bold;">Internet:</span> N/A');
    }
}

// Updates the hidden local timestamp element and updates the visible local clock in right corner
function updateLocalTimestamp() {
    var ts = new Date().getTime();
    glob_local_timestamp = parseInt(ts);
    var local_time = moment(new Date()).format('YYYY/MM/DD HH:mm:ss ZZ');
    $('#clock_local').html('<span style="color:#FFFFFF; font-weight:bold;">Local: </span> ' + local_time);
}

// Converts a unix timestamp to datetime. Ex: 1389789078000 => 2014/01/15 12:31:18+0000
function timestampToDatetime(timestamp) {
    if (timestamp !== null) {
        var timestamp = parseInt(timestamp);
        var currentdate = new Date(parseInt(timestamp));
        var datetime = currentdate.getUTCFullYear() + "/"
                + zeroPadding((currentdate.getUTCMonth()+1))  + "/"
                + zeroPadding(currentdate.getUTCDate()) + " "
                + zeroPadding(currentdate.getUTCHours()) + ":"
                + zeroPadding(currentdate.getUTCMinutes()) + ":"
                + zeroPadding(currentdate.getUTCSeconds()) + "Z";
        return datetime;
    } else {
        return "N/A";
    }
}

// Converts a datetime to unix timestamp. Ex: 2014/01/15 12:31:18+0000 => 1389789078000
function datetimeToTimestamp(datetime) {
    return Date.parse(datetime);
}

// If the number is lesser then 10, then we add a 0 to the front. Ex: 3 => 03 
function zeroPadding(int) {
    if (int < 10) {
        return '0' + int;
    } else {
        return int;
    }
}

// https://github.com/kvz/phpjs/blob/master/functions/strings/wordwrap.js
function wordwrap(str, int_width, str_break, cut) {

  var m = ((arguments.length >= 2) ? arguments[1] : 75);
  var b = ((arguments.length >= 3) ? arguments[2] : '\n');
  var c = ((arguments.length >= 4) ? arguments[3] : false);

  var i, j, l, s, r;

  str += '';

  if (m < 1) {
    return str;
  }

  for (i = -1, l = (r = str.split(/\r\n|\n|\r/))
    .length; ++i < l; r[i] += s) {
    for (s = r[i], r[i] = ''; s.length > m; r[i] += s.slice(0, j) + ((s = s.slice(j))
      .length ? b : '')) {
      j = c == 2 || (j = s.slice(0, m + 1)
        .match(/\S*(\s)?$/))[1] ? m : j.input.length - j[0].length || c == 1 && m || j.input.length + (j = s.slice(
          m)
        .match(/^\S*/))[0].length;
    }
  }

  return r.join('\n');
}

// Capitalize first letter
function ucfirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Generates a random string with chars 0-9a-zA-Z
function randStr(len) {
    return Math.random().toString(36).substring(2, len + 2);
}

// Returns the basename of a filepath. Ex. C:\files\file.txt => file.txt
function basename(path) {
    return path.split('\\').reverse()[0];
}

// Converts bytes with a more human readable prefix
function bytesPrefix(bytes) {
    if (bytes > (1024 * 1024)) {
        output = bytes / (1024 * 1024);
        return String(output.toFixed(2)) + ' MB';
    }
    else if (bytes > 1024) {
        output = bytes / 1024;
        return String(output.toFixed(2)) + ' kB';
    } else {
        return String(bytes) + ' B';
    }
}

/* Login to couchDb.
    The username and password is hardcoded and is in plain text.
    The system's main security is public/private keys, this
      is just a little barrier to prevent others in the same 
      LAN to manipulate the database. */
function couchDbLogin() {
    $.couch.login({
        name: cfg_couchdb_username,
        password: cfg_couchdb_password,
        success: function(data) {
            console.log(data);
        },
        error: function(status) {
            console.log(status);
        }
    });
}

// Checks if a value (needle) is in an array (haystack)
function inArray(needle, haystack) {
    var length = haystack.length;
    for(var i = 0; i < length; i++) {
        if(haystack[i] == needle) return true;
    }
    return false;
}

// Checks whether the input is a number or not
function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

// Deltes a cookie by name
function delCookie(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

// Hides every content section, but the section id in argument
function showOnly(id) {
    var id = '#section_' + id;
    $('#main_content > div').each(function(index, item) {
        $(this).hide();
    });
    $(id).show();
}

$(document).ready(function() {

    document.cookie = 'initiated_external_timestamp=undefined';
    
    // If the order counter is not initialized, we do it now
    if (getCookie('order_counter') == undefined || getCookie('order_counter') == null) {
        document.cookie = 'order_counter=0';
    }
    
    // Sets UUID         
    $.couch.info({
        success: function(data) {
            glob_uuid = data.uuid;
        }
    });
          
    // Sign's in the user into couchdb
    couchDbLogin();

    // Get and updates external timestamp from Internet every 15 minutes
    initExternalTimestamp();
    setInterval(initExternalTimestamp, cfg_upd_extr_timestamp_intval);

    // Sets the local timestamp initially
    updateLocalTimestamp();
    // Update external and local timestamps
    setInterval(updateAllTimes, cfg_timestamp_tick_intval);
    
    // Entries will be updated with new timestamp where there is none.
    setInterval(setExternalTimestamps, cfg_set_extr_timestamp_on_entries_intval);
    
    // Page changer
    $('ul.nav > li').click(function(e) {
        e.preventDefault();
        $('ul.nav > li').removeClass('active');
        $(this).addClass('active');
        var page_id = $(this).find('a').attr('id');
        
        // Displays the wanted section, and hides the rest
        showOnly(page_id.substring(1));
        
        /*
        if (page_id == '_journal') {
            showOnly('journal');
        } else if (page_id == '_actions') {
            showOnly('actions');
        } else if (page_id == '_visualize') {
            showOnly('visualize');
        } else if (page_id == '_help') {
            showOnly('help');
        } else if (page_id == '_utils') {
            showOnly('utils');
        } else if (page_id == '_chat') {
            showOnly('chat');
        }*/
    });

    // Used to show the file name of the selected file to be uploaded as an attechment
	  $(document).on('change', '.btn-file :file', function() {
			  var input = $(this);
			  var numFiles = input.get(0).files ? input.get(0).files.length : 1;
			  var label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
			  input.trigger('fileselect', [numFiles, label]);
	  });
	  
		$(document).on('fileselect', '.btn-file :file', function(event, numFiles, label) {
        var input = $(this).parents('.input-group').find(':text'),
        log = numFiles > 1 ? numFiles + ' files selected' : label;

        if (input.length ) {
            input.val(log);
        } else {
            if (log) { 
                alert(log);
            }
        }
		});
		

});

// Escapes unwanted characters 
function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Input validation of dates
function validDate(str) {
    if (moment(str).isValid()) {
        return true;
    } else {
        alertMsg("The entered date is not valid");
        return false;
    }
}

// Displays an alert message
function alertMsg(msg) {
    BootstrapDialog.show({
        title: 'Error',
        message: msg,
        type: 'type-libellus',
        closable: false,
        buttons: [{
                label: 'Ok',
                cssClass: 'btn-secondary',
                hotkey: 13,
                action: function(dialog){
                    dialog.close();
                }
        }]
    });
}

