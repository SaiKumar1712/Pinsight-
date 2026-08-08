<?php
require "../config.php";
require "../response.php";

$question_text = isset($_POST['question_text']) ? $conn->real_escape_string($_POST['question_text']) : '';
$o_a = isset($_POST['option_a']) ? $conn->real_escape_string($_POST['option_a']) : '';
$o_b = isset($_POST['option_b']) ? $conn->real_escape_string($_POST['option_b']) : '';
$o_c = isset($_POST['option_c']) ? $conn->real_escape_string($_POST['option_c']) : '';
$o_d = isset($_POST['option_d']) ? $conn->real_escape_string($_POST['option_d']) : '';
$correct = isset($_POST['correct_answer']) ? $conn->real_escape_string($_POST['correct_answer']) : '';
$type = isset($_POST['question_type']) ? $conn->real_escape_string($_POST['question_type']) : 'both';

if(empty($question_text) || empty($o_a) || empty($o_b) || empty($o_c) || empty($o_d) || empty($correct)){
    sendResponse(false, "Missing fields");
}

$stmt = $conn->prepare("INSERT INTO questions(question_text, option_a, option_b, option_c, option_d, correct_answer, question_type) VALUES(?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("sssssss", $question_text, $o_a, $o_b, $o_c, $o_d, $correct, $type);

if($stmt->execute()){
    sendResponse(true, "Question added successfully", ["id" => $conn->insert_id]);
} else {
    sendResponse(false, "Failed to add question: " . $conn->error);
}
$stmt->close();
$conn->close();
?>