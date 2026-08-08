<?php
require_once "config.php";
if (isset($conn) && !$conn->connect_error) {
    echo "Database Connected Successfully!";
} else {
    echo "Database Connection Failed: " . ($conn->connect_error ?? "Unknown Error");
}
?>
