// Display docs
function insertHelpSection() {
    $('<div id="section_help" style="display: none;"></div>').appendTo('#main_content');
} 

function insertHelp() {

    // Load the documentation for the software in a iframe
    var html = '<iframe src="static_documentation/index.html" width="100%" class="docs_iframe" seamless></iframe>';
    
    // For when documentation is hosted outside CouchDB, also remember to enable this in the config:
    // help = {couch_httpd_misc_handlers, handle_utils_dir_req, "../../../documentation"}
    // var html = '<iframe src="/help/" width="100%" class="docs_iframe" seamless></iframe>';
     
    /* Apply changes to the html */
    $('#section_help').append(html);
}

// Set height of the iframe, so it matches the browser window size
function setHeight() {
    var height = $(window).height()-60;
    $('.docs_iframe').css('height',+ height +'px');
}

$(document).ready(function() {
    insertHelpSection();
    insertHelp();
    // Reset height every second 
    setInterval(setHeight, 1000);
});

