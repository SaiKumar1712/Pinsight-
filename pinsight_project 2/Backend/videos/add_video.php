<?php
@ini_set('upload_max_filesize', '1000M');
@ini_set('post_max_size', '1000M');
@ini_set('memory_limit', '1024M');
@ini_set('max_execution_time', '1200');

require_once dirname(__DIR__) . "/config.php";
require_once dirname(__DIR__) . "/response.php";

$module_id = isset($_REQUEST['module_id']) ? (int)$_REQUEST['module_id'] : 1;
$video_title = isset($_REQUEST['title']) ? $conn->real_escape_string($_REQUEST['title']) : '';
$ext = isset($_REQUEST['ext']) ? strtolower(preg_replace('/[^a-z0-9]/i', '', $_REQUEST['ext'])) : 'mp4';
if (empty($ext)) $ext = 'mp4';

if (empty($video_title) && isset($_FILES['video']) && isset($_FILES['video']['name'])) {
    $video_title = pathinfo($_FILES['video']['name'], PATHINFO_FILENAME);
}

if (empty($video_title)) {
    $video_title = "Video Module " . time();
}

$db_path = '';
$target_dir = "../uploads/videos/";
if (!is_dir($target_dir)) {
    @mkdir($target_dir, 0777, true);
}

// 1. Check Multipart Form Data Upload (From Web App or iOS multipart request)
$fileKey = null;
if (!empty($_FILES)) {
    if (isset($_FILES['video'])) $fileKey = 'video';
    else if (isset($_FILES['file'])) $fileKey = 'file';
    else if (isset($_FILES['video_file'])) $fileKey = 'video_file';
    else {
        $keys = array_keys($_FILES);
        $fileKey = $keys[0];
    }
}

if ($fileKey && isset($_FILES[$fileKey]) && $_FILES[$fileKey]['error'] === UPLOAD_ERR_OK) {
    $video = $_FILES[$fileKey];
    $original = pathinfo($video['name'], PATHINFO_FILENAME);
    $cleanName = preg_replace('/[^A-Za-z0-9_\-]/', '_', $original);
    $file_ext = strtolower(pathinfo($video['name'], PATHINFO_EXTENSION));
    if (empty($file_ext)) $file_ext = $ext;
    $filename = time() . "_" . $cleanName . "." . $file_ext;
    $target_file = $target_dir . $filename;

    if (move_uploaded_file($video["tmp_name"], $target_file)) {
        $db_path = "uploads/videos/" . $filename;
    } else {
        sendResponse(false, "Failed to save uploaded video file to target directory.", []);
        exit;
    }
} 
// 2. Check Raw Octet-Stream Payload (From iOS Swift uploadTask streaming input)
else {
    $rawInput = file_get_contents('php://input');
    if (!empty($rawInput) && strlen($rawInput) > 100) {
        $cleanTitle = preg_replace('/[^A-Za-z0-9_\-]/', '_', $video_title);
        $filename = time() . "_" . $cleanTitle . "." . $ext;
        $target_file = $target_dir . $filename;

        if (file_put_contents($target_file, $rawInput) !== false) {
            $db_path = "uploads/videos/" . $filename;
        } else {
            sendResponse(false, "Failed to write raw stream video data to file.", []);
            exit;
        }
    } else {
        $errCode = ($fileKey && isset($_FILES[$fileKey]['error'])) ? $_FILES[$fileKey]['error'] : -1;
        $errMsg = "No video file was received by the server. Please select a valid MP4 file.";
        if ($errCode === UPLOAD_ERR_INI_SIZE || $errCode === UPLOAD_ERR_FORM_SIZE) {
            $errMsg = "File size exceeds server upload limit (upload_max_filesize). Please select a smaller file or update php.ini.";
        }
        sendResponse(false, $errMsg, ["error_code" => $errCode]);
        exit;
    }
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
