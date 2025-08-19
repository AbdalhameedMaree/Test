<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/vendor/autoload.php';

$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host = 'smtp.zoho.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'verify@agent-eq.com';
    $mail->Password = 'Y1hVSV4UH6BW';
    $mail->SMTPSecure = 'tls';
    $mail->Port = 587;

    $mail->setFrom('verify@agent-eq.com', 'AgentEQ Test');
    $mail->addAddress('azabood375@gmail.com'); // ضع ايميلك الحقيقي هون

    $mail->isHTML(true);
    $mail->Subject = 'Testing PHPMailer';
    $mail->Body = 'Hello from AgentEQ test email.';

    $mail->send();
    echo 'Message sent!';
} catch (Exception $e) {
    echo 'Mailer Error: ' . $mail->ErrorInfo;
}
