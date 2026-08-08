<?php
require_once dirname(__DIR__) . "/config.php";
require_once dirname(__DIR__) . "/response.php";

$user_id = isset($_REQUEST['user_id']) ? (int)$_REQUEST['user_id'] : (isset($_POST['user_id']) ? (int)$_POST['user_id'] : 0);
$score = isset($_REQUEST['score']) ? (int)$_REQUEST['score'] : (isset($_POST['score']) ? (int)$_POST['score'] : 0);
$total = isset($_REQUEST['total']) && (int)$_REQUEST['total'] > 0 ? (int)$_REQUEST['total'] : (isset($_POST['total']) && (int)$_POST['total'] > 0 ? (int)$_POST['total'] : 10);
$answers_json = isset($_REQUEST['answers']) ? $_REQUEST['answers'] : (isset($_POST['answers']) ? $_POST['answers'] : '[]');

if($user_id <= 0){
    sendResponse(false, "User ID required", []);
    exit;
}

// 1. Check current attempts in user_progress
$attempts = 0;
try {
    $res = $conn->query("SELECT pretest_attempts FROM user_progress WHERE user_id=$user_id");
    if($res && $res->num_rows > 0){
        $attempts = (int)$res->fetch_assoc()['pretest_attempts'];
    }
} catch (Throwable $e) {}

$attempts++;

// 2. Update user_progress summary
try {
    $check = $conn->query("SELECT id FROM user_progress WHERE user_id = $user_id");
    if($check && $check->num_rows > 0){
        $conn->query("UPDATE user_progress SET pretest_done=1, pretest_score=$score, pretest_total=$total, pretest_attempts=$attempts WHERE user_id=$user_id");
    } else {
        $conn->query("INSERT INTO user_progress (user_id, pretest_done, pretest_attempts, pretest_score, pretest_total) VALUES ($user_id, 1, $attempts, $score, $total)");
    }
} catch (Throwable $e) {
    try {
        $conn->query("UPDATE user_progress SET pretest_done=1, pretest_score=$score, pretest_total=$total WHERE user_id=$user_id");
    } catch (Throwable $e2) {}
}

// 2. Store individual answers
$answers = json_decode($answers_json, true);
if(is_array($answers)){
    foreach($answers as $ans){
        if(!is_array($ans)) continue;
        $q_id = isset($ans['question_id']) ? (int)$ans['question_id'] : 0;
        if($q_id <= 0) continue;
        $s_ans = isset($ans['selected_answer']) ? $conn->real_escape_string($ans['selected_answer']) : '';
        $is_corr = isset($ans['is_correct']) ? (int)$ans['is_correct'] : 0;
        $conn->query("INSERT INTO pretest_results(user_id, question_id, selected_answer, is_correct) VALUES($user_id, $q_id, '$s_ans', $is_corr)");
    }
}

sendResponse(true, "Pre-test results saved", [
    "user_id" => $user_id,
    "completed" => true,
    "pretest_done" => 1,
    "status" => "completed",
    "score" => $score,
    "total" => $total
]);
?>