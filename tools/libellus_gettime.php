<?php

// Requires the php5-json package. Debian/Ubuntu: sudo apt-get install php5-json

ini_set('display_errors', 0);

header('Content-Type: application/json');

// Returns time in millitime
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

if (isset($_GET['callback'])) {
    echo $_GET['callback'] . "(";
}

echo json_encode($datetime);

if (isset($_GET['callback'])) {
    echo ")";
}

?>
