<?php
include "../config.php";

header("Content-Type: application/json");

// Validate input
if (!isset($_GET['user_id']) || !isset($_GET['module_id'])) {
    echo json_encode([
        "status" => false,
        "message" => "Missing parameters: user_id, module_id",
        "data" => new stdClass()
    ]);
    exit;
}

$user_id   = $conn->real_escape_string($_GET['user_id']);
$module_id = $conn->real_escape_string($_GET['module_id']);

// Check if user already completed pretest 4 times
$sql = "SELECT pretest_attempts FROM user_progress WHERE user_id='$user_id' LIMIT 1";
$res = $conn->query($sql);
$attempts = 0;

if ($res && $res->num_rows > 0) {
    $row = $res->fetch_assoc();
    $attempts = (int)$row['pretest_attempts'];
}

if ($attempts >= 4) {
    echo json_encode([
        "status" => false,
        "message" => "Pre-test already completed (Maximum 4 attempts reached)",
        "data" => ["attempts" => $attempts]
    ]);
} else {
    echo json_encode([
        "status" => true,
        "message" => "Pre-test allowed",
        "data" => ["attempts" => $attempts]
    ]);
}

?>
