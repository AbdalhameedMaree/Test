<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/../../vendor/autoload.php';

$mail = new PHPMailer(true);

try {
    // إعدادات SMTP الخاصة بـ Zoho
    $mail->isSMTP();
    $mail->Host       = 'smtp.zoho.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'verify@agent-eq.com';     // الإيميل
    $mail->Password   = 'Y1hVSV4UH6BW';       // كلمة مرور التطبيق من Zoho
    $mail->SMTPSecure = 'ssl';
    $mail->Port       = 465;

    // من - إلى
    $mail->setFrom('verify@agent-eq.com', 'AgentEQ Verification');
    $mail->addAddress('mareeabdalhameed@gmail.com', 'User'); // ← هذا الإيميل بدك تغيره عند التشغيل الديناميكي

    // الرسالة
    $mail->isHTML(true);
    $mail->Subject = 'Verify Your Email - AgentEQ';
    $mail->Body    = '<h2>Welcome to AgentEQ!</h2><p>Your verification code is: <strong>123456</strong></p>';
    $mail->AltBody = 'Your verification code is: 123456';

    $mail->send();
    echo 'Verification email sent.';
} catch (Exception $e) {
    echo "Error sending email. Mailer Error: {$mail->ErrorInfo}";
}
?>
