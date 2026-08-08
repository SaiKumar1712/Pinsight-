<?php
require_once dirname(__DIR__) . "/config.php";
require_once dirname(__DIR__) . "/response.php";

$question_id = isset($_POST['id']) ? (int)$_POST['id'] : 0;

if($question_id <= 0){
    sendResponse(false, "id required");
}

if($conn->query("DELETE FROM questions WHERE id=$question_id")){
    sendResponse(true, "Question deleted successfully");
} else {
    sendResponse(false, "Failed to delete question");
}
$conn->close();
?>