<?php
require_once dirname(__DIR__) . "/config.php";
require_once dirname(__DIR__) . "/response.php";

$type = isset($_REQUEST['type']) ? $conn->real_escape_string($_REQUEST['type']) : 'both';

$sql = "SELECT * FROM questions";
if ($type !== 'both') {
    $sql .= " WHERE question_type = '$type' OR question_type = 'both'";
}

$res = $conn->query($sql);

if (!$res) {
    sendResponse(false, "Database error: " . $conn->error);
}

$items = [];
while($row = $res->fetch_assoc()){
    $items[] = $row;
}

sendResponse(true, "Questions loaded", $items);
?>