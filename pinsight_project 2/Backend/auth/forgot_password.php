<?php
require "../config.php";
require "../response.php";
require "MailHelper.php";

date_default_timezone_set("Asia/Kolkata");

if (!isset($_POST['email'])) {
    sendResponse(false, "Email is required");
}

$email = $conn->real_escape_string($_POST['email']);

// Check if user exists
$check = $conn->query("SELECT id FROM users WHERE email='$email' LIMIT 1");

if ($check->num_rows == 0) {
    sendResponse(false, "Email not found");
}

// Generate OTP
$otp = rand(1000, 9999);
$expiry = date("Y-m-d H:i:s", strtotime("+10 minutes"));

// Delete old OTP
$conn->query("DELETE FROM password_resets WHERE email='$email'");

// Insert new OTP
$conn->query("INSERT INTO password_resets(email, otp, expires_at)
              VALUES('$email', '$otp', '$expiry')");

if (MailHelper::sendOTP($email, $otp)) {
    sendResponse(true, "OTP sent to email successfully", [
        "email" => $email
    ]);
} else {
    sendResponse(false, "Failed to send OTP email.");
}
?>
