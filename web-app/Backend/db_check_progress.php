<?php
require "config.php";
$result = $conn->query("SELECT * FROM user_progress");
while($row = $result->fetch_assoc()) {
    print_r($row);
}
?>
