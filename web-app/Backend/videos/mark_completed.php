<?php
require_once dirname(__DIR__) . "/config.php";
require_once dirname(__DIR__) . "/response.php";

$user_id = isset($_POST['user_id']) ? (int)$_POST['user_id'] : 0;
$video_id = isset($_POST['video_id']) ? (int)$_POST['video_id'] : 0;

if ($user_id <= 0 || $video_id <= 0) {
    sendResponse(false, "Invalid user or video ID", []);
    exit;
}

$checkVid = $conn->query("SELECT id FROM videos WHERE id = $video_id");
if (!$checkVid || $checkVid->num_rows == 0) {
    sendResponse(true, "Video progress ignored (video ID not in database)", []);
    exit;
}

$sql = "INSERT INTO video_progress (user_id, video_id, is_completed) 
        VALUES ($user_id, $video_id, 1) 
        ON DUPLICATE KEY UPDATE is_completed = 1";

if ($conn->query($sql)) {
    sendResponse(true, "Video marked as completed", []);
} else {
    sendResponse(false, "DB Error: " . $conn->error, []);
}
$conn->close();
?>
