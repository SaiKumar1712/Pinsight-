<?php
require "config.php";
$result = $conn->query("SELECT * FROM password_resets ORDER BY created_at DESC LIMIT 5");
while($row = $result->fetch_assoc()) {
    print_r($row);
}
?>
