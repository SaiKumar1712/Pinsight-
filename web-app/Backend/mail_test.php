<?php
require "auth/MailHelper.php";
echo MailHelper::sendOTP("test@example.com", "9999") ? "Success" : "Fail";
?>
