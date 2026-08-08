<?php
include "../config.php";

require "../response.php";


header("Content-Type: application/json");

// Validate inputs
if (!isset($_GET['user_id']) || !isset($_GET['module_id'])) {
    echo json_encode([
        "status" => false,
        "message" => "Missing parameters: user_id, module_id",
        "data" => []
    ]);
    exit;
}

$user_id   = $conn->real_escape_string($_GET['user_id']);
$module_id = $conn->real_escape_string($_GET['module_id']);


$res = $conn->query("
SELECT attempt_number FROM test_attempts 
WHERE user_id=$user_id AND module_id=$module_id AND type='post'
ORDER BY attempt_number DESC LIMIT 1
");

$attempt = 0;
if($res && $res->num_rows > 0){
    $attempt = (int)$res->fetch_assoc()['attempt_number'];
}

if($attempt >= 10){
    sendResponse(false, "Maximum attempts reached", ["attempts" => $attempt]);
}
sendResponse(true, "Post-test allowed", ["attempts" => $attempt]);

exit;
?>
