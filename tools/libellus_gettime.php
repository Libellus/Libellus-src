<?php

// Requires the php5-json package. Debian/Ubuntu: sudo apt-get install php5-json

// We dont want to send errors.
ini_set('display_errors', 0);

// Tell the browser that we are sending JSON
header('Content-Type: application/json');

// Returns time in milliseconds
function millitime() {
    $microtime = microtime();
    $comps = explode(' ', $microtime);
    return sprintf('%d%03d', $comps[1], $comps[0] * 1000);
}

// Returns a full datatime string
function fulldatetime() {
    return date('c');
}

$datetime = array();

$datetime['unixTimestamp'] = millitime();
$datetime['dateString'] = fulldatetime();

// Pack the JSON insode a callback function to comply with JSONP.
if (isset($_GET['callback'])) {
    echo $_GET['callback'] . "(";
}

echo json_encode($datetime);

if (isset($_GET['callback'])) {
    echo ")";
}

?>
