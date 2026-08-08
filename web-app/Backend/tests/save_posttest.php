<?php
require_once dirname(__DIR__) . "/config.php";
require_once dirname(__DIR__) . "/response.php";

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
    exit;
}

$attempt++;

// 2. Upsert user_progress summary (Insert if new, update if exists)
$conn->query("INSERT INTO user_progress (user_id, posttest_attempts, best_posttest_score, best_posttest_total) 
              VALUES ($user_id, $attempt, $score, $total) 
              ON DUPLICATE KEY UPDATE 
                posttest_attempts = $attempt, 
                best_posttest_score = GREATEST(best_posttest_score, $score), 
                best_posttest_total = $total");

// 3. Store individual answers
$answers = json_decode($answers_json, true);
if(is_array($answers)){
    foreach($answers as $ans){
        if(!is_array($ans)) continue;
        $q_id = isset($ans['question_id']) ? (int)$ans['question_id'] : 0;
        if($q_id <= 0) continue;
        $s_ans = isset($ans['selected_answer']) ? $conn->real_escape_string($ans['selected_answer']) : '';
        $is_corr = isset($ans['is_correct']) ? (int)$ans['is_correct'] : 0;
        $conn->query("INSERT INTO posttest_results(user_id, attempt_number, question_id, selected_answer, is_correct) VALUES($user_id, $attempt, $q_id, '$s_ans', $is_corr)");
    }
}

sendResponse(true, "Post-test results saved", [
    "attempt" => $attempt,
    "score" => $score,
    "total" => $total
]);
?>