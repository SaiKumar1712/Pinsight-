<?php
require_once dirname(__DIR__) . "/config.php";
require_once dirname(__DIR__) . "/response.php";

$res = $conn->query("SELECT * FROM modules");
$items = [];

while($row = $res->fetch_assoc()){
    $items[] = $row;
}

sendResponse(true, "Modules fetched", ["modules" => $items]);
?>