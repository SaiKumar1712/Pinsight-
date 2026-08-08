<?php
require "../config.php";
require "../response.php";

$email = $_POST['email'];
$new_pass = password_hash($_POST['password'], PASSWORD_BCRYPT);

// Check OTP still exists (extra safety)
$check = $conn->prepare("SELECT id FROM password_resets WHERE email = ? LIMIT 1");
$check->bind_param("s", $email);
$check->execute();
$result = $check->get_result();

if ($result->num_rows == 0) {
    sendResponse(false, "OTP verification required or expired");
    exit;
}
$check->close();

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
