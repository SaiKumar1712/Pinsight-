<?php
require_once dirname(__DIR__) . "/config.php";
require_once dirname(__DIR__) . "/response.php";
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

// Generate 6-digit OTP
$otp = rand(100000, 999999);
$expiry = date("Y-m-d H:i:s", strtotime("+10 minutes"));

// Delete old OTP
$conn->query("DELETE FROM password_resets WHERE email='$email'");

// Insert new OTP
$conn->query("INSERT INTO password_resets(email, otp, expires_at)
              VALUES('$email', '$otp', '$expiry')");

MailHelper::sendOTP($email, $otp);

sendResponse(true, "OTP sent to email successfully", [
    "email" => $email,
    "otp" => $otp
]);
?>
