<?php
require "../config.php";
require "../response.php";

$module_id = isset($_POST['module_id']) ? (int)$_POST['module_id'] : 0;
$video_title = isset($_POST['title']) ? $conn->real_escape_string($_POST['title']) : '';

if(!isset($_FILES['video']) || $module_id <= 0){
    sendResponse(false, "Module ID or video missing", []);
}

$video = $_FILES['video'];

// Generate safe file name
$original = pathinfo($video['name'], PATHINFO_FILENAME);
$cleanName = preg_replace('/[^A-Za-z0-9_\-]/', '_', $original);
$ext = strtolower(pathinfo($video['name'], PATHINFO_EXTENSION));
$filename = time() . "_" . $cleanName . "." . $ext;

$target_dir = "../uploads/videos/";
$target_file = $target_dir . $filename;

// Allowed formats
$allowed = ['mp4', 'mov', 'avi', 'mkv'];
if(!in_array($ext, $allowed)){
    sendResponse(false, "Invalid file type", []);
}

if(!is_dir($target_dir)){
    mkdir($target_dir, 0777, true);
}

if(move_uploaded_file($video["tmp_name"], $target_file)){
    
    $db_path = "uploads/videos/" . $filename;
    
    $sql = "INSERT INTO videos(module_id, video_url, title) 
            VALUES($module_id, '$db_path', '$video_title')";

    if($conn->query($sql)){
        sendResponse(true, "Video uploaded", [
            "video_id" => $conn->insert_id,
            "video_title" => $video_title,
            "video_url" => $db_path
        ]);
    } else {
        sendResponse(false, "Video saved but DB failed", []);
    }

} else {
    sendResponse(false, "Upload failed", []);
}
?>
