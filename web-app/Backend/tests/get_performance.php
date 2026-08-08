<?php
include "db.php";

$user_id = $_GET['user_id'];
$module_id = $_GET['module_id'];

$data = [
    ["title" => "Attention and Impulsivity", "percent" => 60],
    ["title" => "Anxiety", "percent" => 65],
    ["title" => "Treatment Protocols", "percent" => 80]
];

echo json_encode($data);
?>
