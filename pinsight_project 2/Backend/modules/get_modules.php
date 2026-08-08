<?php
require "../config.php";
require "../response.php";

$res = $conn->query("SELECT * FROM modules");
$items = [];

while($row = $res->fetch_assoc()){
    $items[] = $row;
}

sendResponse(true, "Modules fetched", ["modules" => $items]);
?>