<?php
require_once dirname(__DIR__) . "/config.php";
require_once dirname(__DIR__) . "/response.php";

$res = $conn->query("
SELECT users.name, modules.title, test_attempts.*
FROM test_attempts
JOIN users ON users.id = test_attempts.user_id
JOIN modules ON modules.id = test_attempts.module_id
ORDER BY created_at DESC
");

$items = [];
while($row = $res->fetch_assoc()){
    $items[] = $row;
}

sendResponse(true, "All results fetched", ["items" => $items]);
?>