<?php
namespace PHPMailer\PHPMailer;

/**
 * Minimal SMTP class for OTP sending.
 */
class SMTP {
    const DEBUG_OFF = 0;
    const DEBUG_CLIENT = 1;
    const DEBUG_SERVER = 2;
    const LE = "\r\n";
    public $do_debug = 0;
    public $Debugoutput = 'echo';
    public $Timeout = 300;
    protected $smtp_conn;
    protected $error = ['error' => ''];
    protected $last_reply = '';

    public function connect($host, $port = 25, $timeout = 30) {
        $this->smtp_conn = fsockopen($host, $port, $errno, $errstr, $timeout);
        if (!$this->smtp_conn) return false;
        $this->last_reply = fgets($this->smtp_conn, 512);
        return true;
    }

    public function hello($host = '') {
        fwrite($this->smtp_conn, "EHLO $host" . self::LE);
        $this->last_reply = $this->get_lines();
        return true;
    }

    public function startTLS() {
        fwrite($this->smtp_conn, "STARTTLS" . self::LE);
        $this->last_reply = fgets($this->smtp_conn, 512);
        return stream_socket_enable_crypto($this->smtp_conn, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
    }

    public function authenticate($user, $pass) {
        fwrite($this->smtp_conn, "AUTH LOGIN" . self::LE);
        fgets($this->smtp_conn, 512);
        fwrite($this->smtp_conn, base64_encode($user) . self::LE);
        fgets($this->smtp_conn, 512);
        fwrite($this->smtp_conn, base64_encode($pass) . self::LE);
        $this->last_reply = fgets($this->smtp_conn, 512);
        return strpos($this->last_reply, '235') !== false;
    }

    public function mail($from) {
        fwrite($this->smtp_conn, "MAIL FROM:<$from>" . self::LE);
        $this->last_reply = fgets($this->smtp_conn, 512);
        return true;
    }

    public function recipient($to) {
        fwrite($this->smtp_conn, "RCPT TO:<$to>" . self::LE);
        $this->last_reply = fgets($this->smtp_conn, 512);
        return true;
    }

    public function data($msg) {
        fwrite($this->smtp_conn, "DATA" . self::LE);
        fgets($this->smtp_conn, 512);
        fwrite($this->smtp_conn, $msg . self::LE . "." . self::LE);
        $this->last_reply = fgets($this->smtp_conn, 512);
        return true;
    }

    public function quit() {
        fwrite($this->smtp_conn, "QUIT" . self::LE);
        fclose($this->smtp_conn);
    }

    protected function get_lines() {
        $data = '';
        while($str = fgets($this->smtp_conn, 512)) {
            $data .= $str;
            if(substr($str, 3, 1) == ' ') break;
        }
        return $data;
    }
}
