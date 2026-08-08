<?php
require_once dirname(__DIR__) . "/config.php";
require_once dirname(__DIR__) . "/response.php";

$user_id = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;

if ($user_id > 0) {
    $sql = "SELECT v.*, 
            CASE WHEN vp.is_completed = 1 THEN true ELSE false END AS is_completed
            FROM videos v
            LEFT JOIN video_progress vp ON v.id = vp.video_id AND vp.user_id = $user_id
            ORDER BY v.id ASC";
} else {
    $sql = "SELECT v.*, false AS is_completed FROM videos v ORDER BY v.id ASC";
}

$res = $conn->query($sql);
$items = [];

if ($res) {
    while($row = $res->fetch_assoc()){
        $items[] = [
            "id" => (int)$row['id'],
            "title" => $row['title'],
            "video_url" => $row['video_url'],
            "thumbnail_url" => isset($row['thumbnail_url']) ? $row['thumbnail_url'] : '',
            "duration" => isset($row['duration']) ? (string)$row['duration'] . " mins" : "5 mins",
            "is_completed" => (bool)$row['is_completed']
        ];
    }
}

sendResponse(true, "Videos fetched", $items);
$conn->close();
?>