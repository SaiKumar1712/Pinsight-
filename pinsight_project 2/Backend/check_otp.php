<?php
require "config.php";

$sql = "SELECT * FROM password_resets ORDER BY expires_at DESC LIMIT 5";
$res = $conn->query($sql);
$data = [];
while($row = $res->fetch_assoc()){
    $data[] = $row;
}
echo json_encode($data, JSON_PRETTY_PRINT);
?>
