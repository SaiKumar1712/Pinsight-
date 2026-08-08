<?php
require "../config.php";
require "../response.php";

$user_id = isset($_POST['user_id']) ? (int)$_POST['user_id'] : 0;
$score = isset($_POST['score']) ? (int)$_POST['score'] : 0;
$total = isset($_POST['total']) ? (int)$_POST['total'] : 0;
$answers_json = isset($_POST['answers']) ? $_POST['answers'] : '[]';

if($user_id <= 0){
    sendResponse(false, "User ID required", []);
    exit;
}

// 1. Check current attempts in user_progress
$res = $conn->query("SELECT posttest_attempts FROM user_progress WHERE user_id=$user_id");
$attempt = 0;
if($res && $res->num_rows > 0){
    $attempt = (int)$res->fetch_assoc()['posttest_attempts'];
}

if($attempt >= 1000){
    sendResponse(false, "Maximum attempts reached (1000 limit)", ["attempts" => $attempt]);
}

$attempt++;

// 2. Update user_progress summary
$conn->query("UPDATE user_progress SET posttest_attempts=$attempt, best_posttest_score=GREATEST(best_posttest_score, $score), best_posttest_total=$total WHERE user_id=$user_id");

// 3. Store individual answers
$answers = json_decode($answers_json, true);
if(is_array($answers)){
    foreach($answers as $ans){
        $q_id = (int)$ans['question_id'];
        $s_ans = $conn->real_escape_string($ans['selected_answer']);
        $is_corr = (int)$ans['is_correct'];
        $conn->query("INSERT INTO posttest_results(user_id, attempt_number, question_id, selected_answer, is_correct) VALUES($user_id, $attempt, $q_id, '$s_ans', $is_corr)");
    }
}

sendResponse(true, "Post-test results saved", [
    "attempt" => $attempt,
    "score" => $score,
    "total" => $total
]);
?>