<?php
require_once dirname(__DIR__) . "/config.php";
require_once dirname(__DIR__) . "/response.php";

$video_id = isset($_POST['video_id']) ? (int)$_POST['video_id'] : 0;

if($video_id <= 0){
    sendResponse(false, "video_id required", []);
}

$conn->query("DELETE FROM videos WHERE id=$video_id");

sendResponse(true, "Video deleted", []);
?>