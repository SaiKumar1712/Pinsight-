<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: *');
header('Access-Control-Allow-Headers: *');

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

error_reporting(E_ALL);
ini_set('display_errors', 0);

$host = "127.0.0.1";
$user = "root";
$pass = "";
$db = "pinsight_db";
$port = 3306;

$conn = new mysqli($host, $user, $pass, $db, $port);

if($conn->connect_error){
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(["success" => false, "message" => "DB Connection Error: " . $conn->connect_error]);
    exit;
}
?>