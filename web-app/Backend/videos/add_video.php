<?php
@ini_set('upload_max_filesize', '500M');
@ini_set('post_max_size', '500M');
@ini_set('memory_limit', '512M');
@ini_set('max_execution_time', '600');

require_once dirname(__DIR__) . "/config.php";
require_once dirname(__DIR__) . "/response.php";

$module_id = isset($_POST['module_id']) ? (int)$_POST['module_id'] : 1;
$video_title = isset($_POST['title']) ? $conn->real_escape_string($_POST['title']) : '';

if (empty($video_title) && isset($_FILES['video']) && isset($_FILES['video']['name'])) {
    $video_title = pathinfo($_FILES['video']['name'], PATHINFO_FILENAME);
}

if (empty($video_title)) {
    $video_title = "Video Module " . time();
}

$db_path = '';

if (isset($_FILES['video'])) {
    $err = $_FILES['video']['error'];
    if ($err === UPLOAD_ERR_OK) {
        $video = $_FILES['video'];
        $original = pathinfo($video['name'], PATHINFO_FILENAME);
        $cleanName = preg_replace('/[^A-Za-z0-9_\-]/', '_', $original);
        $ext = strtolower(pathinfo($video['name'], PATHINFO_EXTENSION));
        if (empty($ext)) $ext = 'mp4';
        $filename = time() . "_" . $cleanName . "." . $ext;

        $target_dir = "../uploads/videos/";
        $target_file = $target_dir . $filename;

        if (!is_dir($target_dir)) {
            mkdir($target_dir, 0777, true);
        }

        if (move_uploaded_file($video["tmp_name"], $target_file)) {
            $db_path = "uploads/videos/" . $filename;
        } else {
            sendResponse(false, "Failed to move uploaded file to destination server directory.", []);
            exit;
        }
    } else {
        $msg = "File Upload Error ($err): ";
        if ($err === UPLOAD_ERR_INI_SIZE || $err === UPLOAD_ERR_FORM_SIZE) {
            $msg .= "File size exceeds server upload limit.";
        } else {
            $msg .= "Code " . $err;
        }
        sendResponse(false, $msg, []);
        exit;
    }
} else {
    sendResponse(false, "No video file was received by the server. Please select a valid MP4 file.", []);
    exit;
}

$sql = "INSERT INTO videos(module_id, video_url, title) VALUES($module_id, '$db_path', '$video_title')";

if ($conn->query($sql)) {
    sendResponse(true, "Video added successfully", [
        "video_id" => $conn->insert_id,
        "video_title" => $video_title,
        "video_url" => $db_path
    ]);
} else {
    sendResponse(false, "DB Insert failed: " . $conn->error, []);
}
$conn->close();
?>
