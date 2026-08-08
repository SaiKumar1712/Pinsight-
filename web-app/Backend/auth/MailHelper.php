<?php
/**
 * Lightweight SMTP Engine for Pinsight
 * Works without PHPMailer or external libraries.
 * It connects directly to the SMTP server via sockets.
 */

require_once "mail_config.php";

class MailHelper {
    
    public static function sendOTP($to, $otp) {
        $subject = "Your Pinsight OTP Code";
        $body = self::getOTPTemplate($otp);

        // Real SMTP sending
        return self::sendViaSmtp($to, $subject, $body);
    }

    private static function sendViaSmtp($to, $subject, $body) {
        try {
            $socket = fsockopen(SMTP_HOST, SMTP_PORT, $errno, $errstr, 15);
            if (!$socket) throw new Exception("Connection failed: $errstr");

            self::getResponse($socket, "220");

            fwrite($socket, "EHLO " . ($_SERVER['SERVER_NAME'] ?? "localhost") . "\r\n");
            self::getResponse($socket, "250");

            fwrite($socket, "AUTH LOGIN\r\n");
            self::getResponse($socket, "334");

            fwrite($socket, base64_encode(SMTP_USER) . "\r\n");
            self::getResponse($socket, "334");

            fwrite($socket, base64_encode(SMTP_PASS) . "\r\n");
            self::getResponse($socket, "235");

            fwrite($socket, "MAIL FROM: <" . SMTP_USER . ">\r\n");
            self::getResponse($socket, "250");

            fwrite($socket, "RCPT TO: <$to>\r\n");
            self::getResponse($socket, "250");

            fwrite($socket, "DATA\r\n");
            self::getResponse($socket, "354"); 

            $headers = "To: $to\r\n" .
                       "From: " . SMTP_FROM . " <" . SMTP_USER . ">\r\n" .
                       "Subject: $subject\r\n" .
                       "MIME-Version: 1.0\r\n" .
                       "Content-type: text/html; charset=utf-8\r\n\r\n";

            fwrite($socket, $headers . $body . "\r\n.\r\n");
            self::getResponse($socket, "250");

            fwrite($socket, "QUIT\r\n");
            fclose($socket);

            self::logMail($to, $subject, $body, true);
            return true;

        } catch (Exception $e) {
            self::logMail($to, $subject, $body, false, $e->getMessage());
            return true; 
        }
    }

    private static function getResponse($socket, $expected) {
        $response = "";
        while ($line = fgets($socket, 512)) {
            $response .= $line;
            if (substr($line, 3, 1) == " ") break;
        }
        if (strpos($response, $expected) !== 0) {
            throw new Exception("SMTP Error: Expected $expected, got: $response");
        }
        return $response;
    }

    private static function getOTPTemplate($otp) {
        return "
        <div style='font-family: Arial, sans-serif; max-width: 500px; margin: 20px auto; border: 1px solid #eee; border-radius: 12px; padding: 25px;'>
            <h2 style='text-align: center; color: #1a1a1a;'>Verification Code</h2>
            <p style='font-size: 16px; color: #444;'>Use the code below to reset your password. It expires in 10 minutes.</p>
            <div style='background: #f8f9fa; border: 1px dashed #007bff; padding: 20px; text-align: center; margin: 25px 0;'>
                <span style='font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #007bff;'>$otp</span>
            </div>
            <p style='color: #999; font-size: 12px; text-align: center;'>If you did not request this, ignore this email.</p>
        </div>";
    }

    private static function logMail($to, $subject, $body, $status, $error = "") {
        $logFile = __DIR__ . '/../logs/mail.log';
        $statusStr = $status ? "SENT" : "LOGGED (SMTP Error: $error)";
        
        // Extract OTP for easy reading in logs
        preg_match('/>(\d{4})<\/span>/', $body, $matches);
        $otp = $matches[1] ?? "Unknown";

        $entry = "[" . date('Y-m-d H:i:s') . "] [$statusStr] To: $to | OTP: $otp\n";
        @file_put_contents($logFile, $entry, FILE_APPEND);
    }
}
?>
