<?php
header('Content-Type: application/json; charset=utf-8');
require_once dirname(__DIR__) . "/config.php";

$user_id = isset($_REQUEST['user_id']) ? (int)$_REQUEST['user_id'] : 0;

if (!$user_id) {
    echo json_encode(["success" => false, "status" => "error", "message" => "User ID is required"]);
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

// Videos Count & Completion
$tot_v_res = $conn->query("SELECT COUNT(*) as total FROM videos");
$total_videos = ($tot_v_res && $row = $tot_v_res->fetch_assoc()) ? (int)$row['total'] : 0;
if ($total_videos === 0) $total_videos = 4;

$comp_v_res = $conn->query("SELECT COUNT(*) as completed FROM video_progress WHERE user_id = $user_id AND is_completed = 1");
$completed_videos = ($comp_v_res && $row = $comp_v_res->fetch_assoc()) ? (int)$row['completed'] : 0;

$videos_done = ($completed_videos >= $total_videos);

// Post test status
$posttest_attempts = isset($summary['posttest_attempts']) ? (int)$summary['posttest_attempts'] : 0;
$best_posttest_score = isset($summary['best_posttest_score']) ? (int)$summary['best_posttest_score'] : 0;
$best_posttest_total = isset($summary['best_posttest_total']) ? (int)$summary['best_posttest_total'] : 10;

echo json_encode([
    "success" => true,
    "status" => "success",
    "message" => "Dashboard progress loaded",
    "data" => [
        "pretest_done" => $pretest_done ? 1 : 0,
        "pretest_score" => $pretest_score,
        "pretest_total" => $pretest_total,
        "video_completed" => $completed_videos,
        "video_total" => $total_videos,
        "video_done" => $videos_done ? 1 : 0,
        "posttest_attempts" => $posttest_attempts,
        "best_posttest_score" => $best_posttest_score,
        "best_posttest_total" => $best_posttest_total,
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
            "completed" => $completed_videos,
            "total" => $total_videos
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
]);
?>