<?php
require "../config.php";
require "../response.php";

$title = isset($_POST['title']) ? $conn->real_escape_string($_POST['title']) : '';

// Validate title
if (empty($title)) {
    sendResponse(false, "Title is required", []);
}

// Validate uploaded file
if (!isset($_FILES['file'])) {
    sendResponse(false, "File is required", []);
}

$file = $_FILES['file'];

// Upload directory
$upload_dir = "../uploads/modules/";

// Create folder if not exists
if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0777, true);
}

// Allowed file types (customize)
$allowed = ['jpg','jpeg','png'];

$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

if (!in_array($ext, $allowed)) {
    sendResponse(false, "Invalid file type", []);
}

// Create unique file name
$filename = time() . "_" . uniqid() . "." . $ext;
$filepath = $upload_dir . $filename;

// Move file to server
if (!move_uploaded_file($file['tmp_name'], $filepath)) {
    sendResponse(false, "Failed to upload file", []);
}

// Save DB path (relative)
$db_path = "uploads/modules/" . $filename;

// Insert into modules table (save into url column)
$sql = "INSERT INTO modules (title, url) VALUES ('$title', '$db_path')";
if ($conn->query($sql)) {
    sendResponse(true, "Module added successfully", [
        "module_id" => $conn->insert_id,
        "url" => $db_path
    ]);
} else {
    sendResponse(false, "Database insert failed", []);
}
?>
