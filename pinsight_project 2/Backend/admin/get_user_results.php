<?php
require "../config.php";
require "../response.php";

// Fetch all user progress and results
$sql = "SELECT u.id, u.name, u.email, 
        up.pretest_score, up.pretest_total, 
        up.best_posttest_score, up.best_posttest_total, 
        up.posttest_attempts 
        FROM users u
        LEFT JOIN user_progress up ON u.id = up.user_id
        WHERE u.role = 'user'";

$result = $conn->query($sql);
$users = [];

if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $pre_percent = $row['pretest_total'] > 0 ? intval(($row['pretest_score'] / $row['pretest_total']) * 100) : 0;
        $post_percent = $row['best_posttest_total'] > 0 ? intval(($row['best_posttest_score'] / $row['best_posttest_total']) * 100) : 0;
        $improvement = $post_percent - $pre_percent;
        
        $users[] = [
            "id" => (int)$row['id'],
            "name" => $row['name'],
            "email" => $row['email'],
            "pre_test" => $pre_percent,
            "post_test" => $post_percent,
            "attempts" => $row['posttest_attempts'] . "/4",
            "improvement" => $improvement > 0 ? $improvement : 0
        ];
    }
}

sendResponse(true, "User results fetched", $users);
?>
