<?php
require_once dirname(__DIR__) . "/config.php";
require_once dirname(__DIR__) . "/response.php";

$users_res = $conn->query("SELECT COUNT(*) as total FROM users WHERE role = 'user' OR role IS NULL OR role = ''");
$videos_res = $conn->query("SELECT COUNT(*) as total FROM videos");
$questions_res = $conn->query("SELECT COUNT(*) as total FROM questions");

$users_count = ($users_res && $row = $users_res->fetch_assoc()) ? (int)$row['total'] : 0;
$videos_count = ($videos_res && $row = $videos_res->fetch_assoc()) ? (int)$row['total'] : 0;
$questions_count = ($questions_res && $row = $questions_res->fetch_assoc()) ? (int)$row['total'] : 0;

sendResponse(true, "Admin stats fetched", [
    "total_users" => $users_count,
    "total_videos" => $videos_count,
    "total_questions" => $questions_count
]);
?>
