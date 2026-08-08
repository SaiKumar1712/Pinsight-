<?php
include "../config.php";

$user_id = $_GET['user_id'] ?? 0;
$module_id = $_GET['module_id'] ?? 0;

// Validate input
if ($user_id == 0 || $module_id == 0) {
    echo json_encode(["error" => "Missing user_id or module_id"]);
    exit;
}

// Get total questions
$qCount = mysqli_query($conn, "SELECT COUNT(*) AS total FROM questions WHERE module_id=$module_id");
$qRow = mysqli_fetch_assoc($qCount);
$total = $qRow ? intval($qRow['total']) : 0;

if ($total == 0) {
    echo json_encode(["error" => "No questions found", "total" => 0]);
    exit;
}

// Function to get last score by type
function getLastScore($conn, $user_id, $module_id, $type) {
    $sql = "SELECT score FROM test_attempts 
            WHERE user_id=$user_id AND module_id=$module_id AND type='$type' 
            ORDER BY id DESC LIMIT 1";

    $res = mysqli_query($conn, $sql);
    $row = mysqli_fetch_assoc($res);

    return $row ? intval($row['score']) : 0; // default 0 if no record
}

// Fetch both PRE and POST scores
$preScore  = getLastScore($conn, $user_id, $module_id, 'pre');
$postScore = getLastScore($conn, $user_id, $module_id, 'post');

// Calculate results
function calculateResult($score, $total) {
    $correct = $score;
    $incorrect = $total - $score;
    $percentage = ($total > 0) ? round(($correct / $total) * 100, 0) : 0;

    return [
        "score" => $score,
        "correct" => $correct,
        "incorrect" => $incorrect,
        "percentage" => $percentage
    ];
}

$response = [
    "total_questions" => $total,
    "pre_test" => calculateResult($preScore, $total),
    "post_test" => calculateResult($postScore, $total)
];

echo json_encode($response);
?>
