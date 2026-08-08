<?php
require_once dirname(__DIR__) . "/config.php";
require_once dirname(__DIR__) . "/response.php";

if (!isset($_POST['email']) || !isset($_POST['otp'])) {
    sendResponse(false, "Email and OTP required");
}

$email = trim($_POST['email']);
$otp = trim($_POST['otp']);

// Validate format
if ($email == "" || $otp == "") {
    sendResponse(false, "Invalid inputs");
}

$stmt = $conn->prepare("SELECT id FROM password_resets WHERE email = ? AND otp = ? AND expires_at >= NOW() LIMIT 1");
$stmt->bind_param("ss", $email, $otp);
$stmt->execute();
$result = $stmt->get_result();

if ($result && $result->num_rows > 0) {
    sendResponse(true, "OTP verified successfully", [
        "email" => $email
    ]);
} else {
    sendResponse(false, "Invalid or expired OTP");
}
$stmt->close();
?>
