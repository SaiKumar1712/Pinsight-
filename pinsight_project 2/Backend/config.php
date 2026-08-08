<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}
error_reporting(E_ALL);
ini_set('display_errors', 1);
$host = "127.0.0.1";
$user = "root";
$pass = "";
$db = "pinsight_db";
$root = 3306;

$conn = new mysqli($host, $user, $pass, $db,$root);

if($conn->connect_error){
    die("DB Error: " . $conn->connect_error);
}
?>