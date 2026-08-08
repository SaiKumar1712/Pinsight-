<?php
require "config.php";
require "response.php";

if ($conn) {
    $res = $conn->query("SELECT COUNT(*) as count FROM users");
    if ($res) {
        $row = $res->fetch_assoc();
        sendResponse(true, "DB Connection OK", ["user_count" => $row['count']]);
    } else {
        sendResponse(false, "Query failed: " . $conn->error);
    }
} else {
    sendResponse(false, "Connection object not found");
}
?>
