<?php
require "../config.php";
require "../response.php";

$user_id = isset($_POST['user_id']) ? (int)$_POST['user_id'] : 0;
$video_id = isset($_POST['video_id']) ? (int)$_POST['video_id'] : 0;

if($user_id <= 0 || $video_id <= 0){
    sendResponse(false, "user_id and video_id are required");
}

// Check if progress already exists
$check = $conn->query("SELECT id FROM video_progress WHERE user_id = $user_id AND video_id = $video_id");

if($check->num_rows > 0){
    $conn->query("UPDATE video_progress SET is_completed=1, completed_at=NOW() WHERE user_id=$user_id AND video_id=$video_id");
} else {
    $conn->query("INSERT INTO video_progress(user_id, video_id, is_completed, completed_at) VALUES($user_id, $video_id, 1, NOW())");
}

// Update user_progress summary if all videos are done
$total_videos = $conn->query("SELECT COUNT(*) as total FROM videos")->fetch_assoc()['total'];
$completed_videos = $conn->query("SELECT COUNT(*) as completed FROM video_progress WHERE user_id = $user_id AND is_completed = 1")->fetch_assoc()['completed'];

if($completed_videos >= $total_videos){
    $conn->query("UPDATE user_progress SET video_done=1 WHERE user_id=$user_id");
}

sendResponse(true, "Video marked as completed", ["completed" => $completed_videos, "total" => $total_videos]);
?>
