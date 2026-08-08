<?php
header("Content-Type: application/json");
include 'config.php'; // DB connection

$response = array();
$list = array();

// Check test_id input
if (!isset($_POST['test_id'])) {
    $response['error'] = true;
    $response['message'] = "test_id is required";
    echo json_encode($response);
    exit;
}

$test_id = $_POST['test_id'];

// Fetch only questions and correct answers
$sql = "SELECT id, question, option1, option2, option3, option4, correct_answer 
        FROM tbl_questions 
        WHERE test_id = '$test_id'";

$result = mysqli_query($con, $sql);

if (mysqli_num_rows($result) > 0) {

    while ($row = mysqli_fetch_assoc($result)) {

        // We don't add user_answer or status
        $list[] = array(
            "id" => $row['id'],
            "question" => $row['question'],
            "option1" => $row['option1'],
            "option2" => $row['option2'],
            "option3" => $row['option3'],
            "option4" => $row['option4'],
            "correct_answer" => $row['correct_answer']
        );
    }

    $response['error'] = false;
    $response['questions'] = $list;

} else {
    $response['error'] = true;
    $response['message'] = "No Questions Found";
}

echo json_encode($response);
?>
