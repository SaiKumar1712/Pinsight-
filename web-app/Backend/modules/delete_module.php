<?php
require_once dirname(__DIR__) . "/config.php";
require_once dirname(__DIR__) . "/response.php";

$module_id = isset($_POST['module_id']) ? (int)$_POST['module_id'] : 0;

if($module_id <= 0){
    sendResponse(false, "module_id required", []);
}

/* delete related videos & questions handled by FK cascade, but remove explicit just in case */
$conn->query("DELETE FROM videos WHERE module_id=$module_id");
$conn->query("DELETE FROM questions WHERE module_id=$module_id");
$conn->query("DELETE FROM modules WHERE id=$module_id");

sendResponse(true, "Module deleted", []);
?>