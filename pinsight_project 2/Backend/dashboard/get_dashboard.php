<?php
require "../config.php";
require "../response.php";

$user_id = isset($_REQUEST['user_id']) ? (int)$_REQUEST['user_id'] : (isset($_POST['user_id']) ? (int)$_POST['user_id'] : 0);

if (!$user_id) {
    sendResponse(false, "User ID missing", []);
    exit;
}

$summary_query = $conn->query("SELECT * FROM user_progress WHERE user_id = $user_id ORDER BY id DESC LIMIT 1");
$summary = ($summary_query && $summary_query->num_rows > 0) ? $summary_query->fetch_assoc() : null;

$pretest_done = false;
$pretest_score = 0;
$pretest_total = 10;

if ($summary) {
    if ((int)($summary['pretest_done'] ?? 0) === 1 || (int)($summary['pretest_attempts'] ?? 0) > 0 || (int)($summary['pretest_score'] ?? 0) > 0) {
        $pretest_done = true;
    }
    $pretest_score = (int)($summary['pretest_score'] ?? 0);
    if (isset($summary['pretest_total']) && (int)$summary['pretest_total'] > 0) {
        $pretest_total = (int)$summary['pretest_total'];
    }
}

// Fallback check against pretest_results table
$pre_res = $conn->query("SELECT COUNT(*) as cnt, SUM(is_correct) as score FROM pretest_results WHERE user_id = $user_id");
if ($pre_res && $row = $pre_res->fetch_assoc()) {
    $count = (int)($row['cnt'] ?? 0);
    if ($count > 0) {
        $pretest_done = true;
        if ($pretest_score === 0) {
            $pretest_score = (int)($row['score'] ?? 0);
        }
        if ($pretest_total <= 0) {
            $pretest_total = ($count <= 10) ? $count : 10;
        }
    }
}

if ($pretest_done) {
    try {
        $conn->query("UPDATE user_progress SET pretest_done=1, pretest_score=$pretest_score, pretest_total=$pretest_total WHERE user_id=$user_id");
    } catch (Throwable $e) {}
}

// Get video stats
$video_total_res = $conn->query("SELECT COUNT(*) as total FROM videos");
$video_total = ($video_total_res) ? (int)$video_total_res->fetch_assoc()['total'] : 0;
if ($video_total === 0) $video_total = 3;

$video_done_res = $conn->query("SELECT COUNT(*) as done FROM video_progress WHERE user_id = $user_id AND is_completed = 1");
if (!$video_done_res) {
    $video_done_res = $conn->query("SELECT COUNT(*) as done FROM video_completions WHERE user_id = $user_id");
}
$video_done = ($video_done_res) ? (int)$video_done_res->fetch_assoc()['done'] : 0;
$videos_done = ($video_total > 0 && $video_done >= $video_total);

$posttest_attempts = (int)($summary['posttest_attempts'] ?? 0);
$best_posttest_score = (int)($summary['best_posttest_score'] ?? 0);
$best_posttest_total = (int)($summary['best_posttest_total'] ?? 10);

$response = [
    "success" => true,
    "message" => "Dashboard loaded",
    "data" => [
        "pretest" => [
            "completed" => $pretest_done,
            "done" => $pretest_done,
            "status" => $pretest_done ? "Completed" : "Available",
            "score" => $pretest_score,
            "total" => $pretest_total
        ],
        "videos" => [
            "unlocked" => $pretest_done,
            "status" => $pretest_done ? "Available" : "Locked",
            "done" => $videos_done,
            "completed" => $video_done,
            "total" => $video_total
        ],
        "posttest" => [
            "unlocked" => ($pretest_done && $videos_done),
            "status" => ($pretest_done && $videos_done) ? "Available" : "Locked",
            "done" => ($posttest_attempts > 0),
            "attempts" => $posttest_attempts,
            "bestScore" => $best_posttest_score,
            "best_score" => $best_posttest_score,
            "bestTotal" => $best_posttest_total
        ]
    ]
];

echo json_encode($response);
?>