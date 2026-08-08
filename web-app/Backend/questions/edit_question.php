<?php
require_once dirname(__DIR__) . "/config.php";
require_once dirname(__DIR__) . "/response.php";

$question_id = isset($_POST['question_id']) ? (int)$_POST['question_id'] : 0;
$q = isset($_POST['question']) ? $conn->real_escape_string($_POST['question']) : '';
$o1 = isset($_POST['opt1']) ? $conn->real_escape_string($_POST['opt1']) : '';
$o2 = isset($_POST['opt2']) ? $conn->real_escape_string($_POST['opt2']) : '';
$o3 = isset($_POST['opt3']) ? $conn->real_escape_string($_POST['opt3']) : '';
$o4 = isset($_POST['opt4']) ? $conn->real_escape_string($_POST['opt4']) : '';
$ans = isset($_POST['answer']) ? (int)$_POST['answer'] : 0;

if($question_id <= 0 || empty($q) || empty($o1) || empty($o2) || empty($o3) || empty($o4) || $ans <= 0){
    sendResponse(false, "Missing fields or invalid answer", []);
}

$sql = "UPDATE questions SET 
        question='$q',
        opt1='$o1',
        opt2='$o2',
        opt3='$o3',
        opt4='$o4',
        answer=$ans
        WHERE id=$question_id";

if($conn->query($sql)){
    sendResponse(true, "Question updated", ["question_id" => $question_id]);
} else {
    sendResponse(false, "Failed to update question", []);
}
?>