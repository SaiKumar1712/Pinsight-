<?php
require_once dirname(__DIR__) . "/config.php";
require_once dirname(__DIR__) . "/response.php";

$user_id = isset($_POST['user_id']) ? (int)$_POST['user_id'] : 0;

if(!$user_id) {
    sendResponse(false, "User ID missing");
}

// Get all post-test attempts by grouping results
$sql = "
    SELECT 
        attempt_number as id, 
        SUM(is_correct) as score, 
        COUNT(*) as total, 
        MAX(submitted_at) as created_at 
    FROM posttest_results 
    WHERE user_id = $user_id 
    GROUP BY attempt_number 
    ORDER BY attempt_number DESC
";

$query = $conn->query($sql);
if (!$query) {
    sendResponse(false, "History query error: " . $conn->error);
}

$history = [];
while($row = $query->fetch_assoc()){
    // Ensure numeric values are returned as integers
    $row['id'] = isset($row['id']) ? (int)$row['id'] : 0;
    $row['score'] = isset($row['score']) ? (int)$row['score'] : 0;
    $row['total'] = isset($row['total']) ? (int)$row['total'] : 0;
    $history[] = $row;
}

sendResponse(true, "History loaded", $history);
?>
