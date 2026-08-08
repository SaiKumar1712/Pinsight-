<?php
require "../config.php";
require "../response.php";

$video_id = isset($_POST['video_id']) ? (int)$_POST['video_id'] : 0;
$url = isset($_POST['video_url']) ? $conn->real_escape_string($_POST['video_url']) : '';

if($video_id <= 0 || empty($url)){
    sendResponse(false, "Missing fields", []);
}

$sql = "UPDATE videos SET video_url='$url' WHERE id=$video_id";

if($conn->query($sql)){
    sendResponse(true, "Video updated", ["video_id" => $video_id]);
} else {
    sendResponse(false, "Video update failed", []);
}
?>