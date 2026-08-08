<?php
require "../config.php";
require "../response.php";

$type = isset($_GET['type']) ? $conn->real_escape_string($_GET['type']) : 'both';

$sql = "SELECT * FROM questions";
if ($type !== 'both') {
    $sql .= " WHERE question_type = '$type' OR question_type = 'both'";
}

$res = $conn->query($sql);

// SAFETY CHECK: If the query fails (e.g. database column error), return an error message instead of crashing.
if (!$res) {
    sendResponse(false, "Database error: " . $conn->error);
}

$items = [];
while($row = $res->fetch_assoc()){
    $items[] = $row;
}

sendResponse(true, "Questions loaded", $items);
?>