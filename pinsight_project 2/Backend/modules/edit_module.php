<?php
require "../config.php";
require "../response.php";

$module_id = isset($_POST['module_id']) ? (int)$_POST['module_id'] : 0;
$title = isset($_POST['title']) ? $conn->real_escape_string($_POST['title']) : '';

if($module_id <= 0 || empty($title)){
    sendResponse(false, "Missing fields", []);
}

$sql = "UPDATE modules SET title='$title' WHERE id=$module_id";

if($conn->query($sql)){
    sendResponse(true, "Module updated", ["module_id" => $module_id]);
} else {
    sendResponse(false, "Update failed", []);
}
?>