<?php
require_once dirname(__DIR__) . "/config.php";
require_once dirname(__DIR__) . "/response.php";

$name = isset($_POST['name']) ? trim($_POST['name']) : '';
$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$mobile = isset($_POST['mobile']) ? trim($_POST['mobile']) : '';
$password_raw = isset($_POST['password']) ? $_POST['password'] : '';

if(empty($name) || empty($email) || empty($password_raw)){
    sendResponse(false, "Missing fields");
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendResponse(false, "Invalid email format");
    exit;
}

// Check if user already exists
$checkUser = $conn->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
$checkUser->bind_param("s", $email);
$checkUser->execute();
$result = $checkUser->get_result();

if ($result->num_rows > 0) {
    sendResponse(false, "Email already registered. Please login.");
    exit;
}
$checkUser->close();

$admin_code = isset($_POST['admin_code']) ? trim($_POST['admin_code']) : (isset($_POST['clinic_code']) ? trim($_POST['clinic_code']) : '');
$role = (strtoupper($admin_code) === 'PINSIGHT') ? 'admin' : 'user';

$password = password_hash($password_raw, PASSWORD_DEFAULT);

$stmt = $conn->prepare("INSERT INTO users(name,email,mobile,password,role) VALUES(?,?,?,?,?)");
$stmt->bind_param("sssss", $name, $email, $mobile, $password, $role);

if($stmt->execute()){
    $user_id = (int)$conn->insert_id;
    sendResponse(true, "Signup successful", [
        "user_id" => $user_id,
        "name" => $name,
        "email" => $email,
        "user_type" => $role,
        "role" => $role
    ]);
} else {
    sendResponse(false, "Failed to signup: " . $conn->error);
}
$stmt->close();
$conn->close();
?>