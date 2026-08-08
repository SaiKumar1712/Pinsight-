<?php
require_once dirname(__DIR__) . "/config.php";
require_once dirname(__DIR__) . "/response.php";

$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$raw_pass = isset($_POST['new_password']) ? trim($_POST['new_password']) : (isset($_POST['password']) ? trim($_POST['password']) : '');

if (empty($email)) {
    sendResponse(false, "Missing email address");
    exit;
}

if (empty($raw_pass)) {
    sendResponse(false, "New password cannot be empty");
    exit;
}

$new_pass = password_hash($raw_pass, PASSWORD_BCRYPT);

// Update user table
$update = $conn->prepare("UPDATE users SET password = ? WHERE email = ?");
$update->bind_param("ss", $new_pass, $email);

if ($update->execute()) {
    // Delete OTP so it cannot be reused
    $delete = $conn->prepare("DELETE FROM password_resets WHERE email = ?");
    $delete->bind_param("s", $email);
    $delete->execute();
    $delete->close();

    sendResponse(true, "Password reset successful");
} else {
    sendResponse(false, "Failed to update password: " . $conn->error);
}
$update->close();
?>
