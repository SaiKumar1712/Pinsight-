<?php
require "../config.php";
require "../response.php";

$user_id = isset($_REQUEST['user_id']) ? (int)$_REQUEST['user_id'] : (isset($_POST['user_id']) ? (int)$_POST['user_id'] : 0);
$score = isset($_REQUEST['score']) ? (int)$_REQUEST['score'] : (isset($_POST['score']) ? (int)$_POST['score'] : 0);
$total = isset($_REQUEST['total']) && (int)$_REQUEST['total'] > 0 ? (int)$_REQUEST['total'] : (isset($_POST['total']) && (int)$_POST['total'] > 0 ? (int)$_POST['total'] : 10);
$answers_json = isset($_REQUEST['answers']) ? $_REQUEST['answers'] : (isset($_POST['answers']) ? $_POST['answers'] : '[]');

if($user_id <= 0){
    sendResponse(false, "User ID is required", []);
    exit;
}

// Verify user_id exists in users table to prevent Foreign Key 500 errors
$user_check = $conn->query("SELECT id FROM users WHERE id = $user_id");
if (!$user_check || $user_check->num_rows === 0) {
    sendResponse(false, "User account not found (ID: $user_id). Please log in again.");
    exit;
}

// Safely ensure pretest_attempts column exists if missing in user_progress table
try {
    $check_col = $conn->query("SHOW COLUMNS FROM user_progress LIKE 'pretest_attempts'");
    if (!$check_col || $check_col->num_rows === 0) {
        $conn->query("ALTER TABLE user_progress ADD pretest_attempts INT DEFAULT 0");
    }
} catch (Throwable $e) {
    // Ignore schema check errors
}

// 1. Update or Insert summary in user_progress
try {
    $check = $conn->query("SELECT id FROM user_progress WHERE user_id = $user_id");
    if($check && $check->num_rows > 0){
        $conn->query("UPDATE user_progress SET pretest_done=1, pretest_score=$score, pretest_total=$total, pretest_attempts=GREATEST(COALESCE(pretest_attempts, 0), 1) WHERE user_id=$user_id");
    } else {
        $conn->query("INSERT INTO user_progress (user_id, pretest_done, pretest_score, pretest_total, pretest_attempts) VALUES ($user_id, 1, $score, $total, 1)");
    }
} catch (Throwable $e) {
    try {
        $conn->query("UPDATE user_progress SET pretest_done=1, pretest_score=$score, pretest_total=$total WHERE user_id=$user_id");
    } catch (Throwable $e2) {}
}

// 2. Save detailed question answers in pretest_results
$answers_json_clean = stripslashes($answers_json);
$answers = json_decode($answers_json_clean, true);
if(!is_array($answers)){
    $answers = json_decode($answers_json, true);
}

if(is_array($answers)){
    foreach($answers as $ans){
        if(!is_array($ans)) continue;
        $q_id = isset($ans['question_id']) ? (int)$ans['question_id'] : 0;
        if($q_id <= 0) continue;
        $s_ans = isset($ans['selected_answer']) ? strtolower($conn->real_escape_string($ans['selected_answer'])) : '';
        $is_corr = isset($ans['is_correct']) ? (int)$ans['is_correct'] : 0;
        try {
            $conn->query("INSERT INTO pretest_results(user_id, question_id, selected_answer, is_correct) VALUES($user_id, $q_id, '$s_ans', $is_corr)");
        } catch (Throwable $e) {}
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