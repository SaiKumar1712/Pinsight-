<?php
function sendResponse($success, $message, $data = null) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        "success" => (bool) $success,
        "message" => $message,
        "data" => $data
    ]);
    exit;
}
?>