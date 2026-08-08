<?php
require "../config.php";
require "../response.php";

// Optional: If you are directly using login.php, no need for action
$action = isset($_POST['action']) ? $_POST['action'] : 'login';

// If you still want action check, keep this
if ($action !== "login") {
    sendResponse(false, "Invalid action");
    exit;
}

// Get POST values safely
$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$password = isset($_POST['password']) ? trim($_POST['password']) : '';

// Validate inputs
if (empty($email)) {
    sendResponse(false, "Missing email");
    exit;
}

if (empty($password)) {
    sendResponse(false, "Missing password");
    exit;
}

// Prepare statement (SECURE WAY)
$stmt = $conn->prepare("SELECT id, name, email, password, role FROM users WHERE email = ? LIMIT 1");

if (!$stmt) {
    sendResponse(false, "Database prepare error: " . $conn->error);
    exit;
}

$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    sendResponse(false, "Email not found");
    exit;
}

$row = $result->fetch_assoc();

// Verify password
if (password_verify($password, $row['password'])) {

    sendResponse(true, "Login successful", [
        "user_id" => (int)$row['id'],
        "name" => $row['name'],
        "email" => $row['email'],
        "user_type" => $row['role']
    ]);

} else {
    sendResponse(false, "Wrong password");
}

$stmt->close();
$conn->close();
?>