<?php
require "../config.php";
require "../response.php";

$user_id = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;

if($user_id <= 0){
    sendResponse(false, "user_id required");
}

$sql = "SELECT v.*, 
        CASE WHEN vp.is_completed = 1 THEN true ELSE false END AS is_completed
        FROM videos v
        LEFT JOIN video_progress vp ON v.id = vp.video_id AND vp.user_id = $user_id
        ORDER BY v.order_index ASC";

$res = $conn->query($sql);
$items = [];

while($row = $res->fetch_assoc()){
    $items[] = [
        "id" => (int)$row['id'],
        "title" => $row['title'],
        "video_url" => $row['video_url'],
        "thumbnail_url" => $row['thumbnail_url'],
        "duration" => (string)$row['duration'] . " mins",
        "is_completed" => (bool)$row['is_completed']
    ];
}

sendResponse(true, "Videos fetched", $items);
$conn->close();
?>