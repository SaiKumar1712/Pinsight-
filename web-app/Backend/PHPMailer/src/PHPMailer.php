<?php
namespace PHPMailer\PHPMailer;

class PHPMailer {
    const ENCRYPTION_STARTTLS = 'tls';
    const ENCRYPTION_SMTPS = 'ssl';
    
    public $Priority = null;
    public $CharSet = 'utf-8';
    public $ContentType = 'text/html';
    public $Encoding = '8bit';
    public $ErrorInfo = '';
    public $From = '';
    public $FromName = '';
    public $Subject = '';
    public $Body = '';
    public $AltBody = '';
    public $Host = 'localhost';
    public $Port = 25;
    public $SMTPSecure = '';
    public $SMTPAuth = false;
    public $Username = '';
    public $Password = '';
    public $Timeout = 300;
    protected $smtp;
    protected $to = [];

    public function __construct($exceptions = false) {}

    public function isSMTP() {
        $this->smtp = new SMTP();
    }

    public function setFrom($address, $name = '') {
        $this->From = $address;
        $this->FromName = $name;
    }

    public function addAddress($address, $name = '') {
        $this->to[] = [$address, $name];
    }

    public function isHTML($is_html = true) {
        $this->ContentType = $is_html ? 'text/html' : 'text/plain';
    }

    public function send() {
        try {
            if (!$this->smtp->connect($this->Host, $this->Port)) throw new \Exception("Connect failed");
            $this->smtp->hello("localhost");
            if ($this->SMTPSecure == 'tls') $this->smtp->startTLS();
            if ($this->SMTPAuth) {
                if(!$this->smtp->authenticate($this->Username, $this->Password)) throw new \Exception("Auth failed");
            }
            $this->smtp->mail($this->From);
            foreach($this->to as $addr) $this->smtp->recipient($addr[0]);
            
            $header = "Date: " . date('D, j M Y H:i:s O') . "\r\n";
            $header .= "To: " . $this->to[0][0] . "\r\n";
            $header .= "From: " . $this->FromName . " <" . $this->From . ">\r\n";
            $header .= "Subject: " . $this->Subject . "\r\n";
            $header .= "MIME-Version: 1.0\r\n";
            $header .= "Content-Type: " . $this->ContentType . "; charset=" . $this->CharSet . "\r\n\r\n";
            
            $this->smtp->data($header . $this->Body);
            $this->smtp->quit();
            return true;
        } catch (\Exception $e) {
            $this->ErrorInfo = $e->getMessage();
            return false;
        }
    }
}
