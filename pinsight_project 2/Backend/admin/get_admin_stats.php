<?php
require "../config.php";
require "../response.php";

$users_res = $conn->query("SELECT COUNT(*) as total FROM users WHERE role = 'user'");
$videos_res = $conn->query("SELECT COUNT(*) as total FROM videos");

// SAFETY CHECKS
if (!$users_res || !$videos_res) {
    sendResponse(false, "Database error in stats: " . $conn->error);
}

$users_count = $users_res->fetch_assoc()['total'];
$videos_count = $videos_res->fetch_assoc()['total'];

sendResponse(true, "Admin stats fetched", [
    "total_users" => (int)$users_count,
    "total_videos" => (int)$videos_count
]);
?>
