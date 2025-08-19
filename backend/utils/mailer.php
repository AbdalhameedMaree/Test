<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../config.php';

function generateRandomToken($length = 32) {
    return bin2hex(random_bytes($length / 2));
}

function sendPasswordResetEmail($to, $first_name, $token) {
    $mail = new PHPMailer(true);

    try {
        // Server settings
        $mail->isSMTP();
        $mail->Host = 'smtp.zoho.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'verify@agent-eq.com';
        $mail->Password = 'Y1hVSV4UH6BW';
        $mail->SMTPSecure = 'tls';
        $mail->Port = 587;

        // Recipients
        $mail->setFrom('verify@agent-eq.com', 'AgentEQ Support');
        $mail->addAddress($to, $first_name);

        // Content
        $mail->isHTML(true);
        $mail->Subject = 'Reset Your Password – AgentEQ';
        $mail->Body = "
            <div style='font-family:sans-serif;padding:20px;border:1px solid #eee;border-radius:8px;max-width:500px;margin:auto'>
                <h2 style='color:#333;'>Hello $first_name,</h2>
                <p>You requested to reset your password. Use the code below to proceed:</p>
                <div style='font-size:24px;font-weight:bold;margin:20px 0;color:#dc3545;'>$token</div>
                <p>If you didn’t request this, just ignore this email.</p>
                <br><p>— The AgentEQ Support Team</p>
            </div>
        ";

        $mail->send();
    } catch (Exception $e) {
        error_log('Password Reset Email Error: ' . $mail->ErrorInfo);
    }
}


function sendContactNotificationEmail($customer_name, $customer_email, $company, $message) {
    $mail = new PHPMailer(true);

    try {
        // Server settings
        $mail->isSMTP();
        $mail->Host = 'smtp.zoho.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'verify@agent-eq.com';
        $mail->Password = 'Y1hVSV4UH6BW';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;

        // Headers for better deliverability
        $mail->CharSet = 'UTF-8';
        $mail->Encoding = 'base64';
        $mail->addReplyTo($customer_email, $customer_name);

        // Recipients - send to the same email that handles verification
        $mail->setFrom('verify@agent-eq.com', 'AgentEQ Contact Form');
        $mail->addAddress('verify@agent-eq.com', 'AgentEQ Support');

        // Subject
        $mail->Subject = '📧 New Contact Form Submission - AgentEQ';

        // Format company info
        $company_info = $company ? "<strong>Company:</strong> $company<br>" : '';
        
        // HTML Body
        $mail->isHTML(true);
        $mail->Body = "
        <html>
          <body style='background-color:#f9f9f9;padding:0;margin:0;'>
            <div style='max-width:600px;margin:40px auto;padding:30px;background:#ffffff;border:1px solid #e5e5e5;border-radius:10px;font-family:Helvetica,Arial,sans-serif;color:#333;'>
              <h2 style='color:#005eff;margin-bottom:20px;'>📧 New Contact Form Submission</h2>
              
              <div style='background:#f8f9fa;padding:20px;border-radius:8px;margin:20px 0;'>
                <h3 style='color:#333;margin-top:0;'>Customer Information</h3>
                <strong>Name:</strong> $customer_name<br>
                <strong>Email:</strong> <a href='mailto:$customer_email' style='color:#005eff;'>$customer_email</a><br>
                $company_info
              </div>
              
              <div style='background:#fff;padding:20px;border:1px solid #e9ecef;border-radius:8px;margin:20px 0;'>
                <h3 style='color:#333;margin-top:0;'>Message</h3>
                <p style='line-height:1.6;white-space:pre-wrap;'>$message</p>
              </div>
              
              <div style='margin-top:30px;padding:15px;background:#e3f2fd;border-radius:6px;'>
                <p style='margin:0;font-size:14px;color:#0277bd;'>
                  💡 <strong>Quick Action:</strong> Reply directly to this email to respond to the customer.
                </p>
              </div>
              
              <hr style='border:none;border-top:1px solid #eee;margin:40px 0;' />
              <p style='font-size:12px;color:#999;text-align:center;'>
                AgentEQ Contact Form Notification<br>
                Submitted on " . date('F j, Y \a\t g:i A') . "
              </p>
            </div>
          </body>
        </html>
        ";

        // Plain text fallback
        $mail->AltBody = "New Contact Form Submission\n\n" .
                        "Name: $customer_name\n" .
                        "Email: $customer_email\n" .
                        ($company ? "Company: $company\n" : '') .
                        "\nMessage:\n$message\n\n" .
                        "Submitted on " . date('F j, Y \a\t g:i A');

        // Send the email
        $mail->send();
        error_log("✅ Contact notification email sent for: $customer_name ($customer_email)");
        
    } catch (Exception $e) {
        error_log('❌ Contact Notification Email Error: ' . $mail->ErrorInfo);
        throw $e; // Re-throw to be handled by the calling function
    }
}

function sendVerificationEmail($to, $first_name, $token) {
    $mail = new PHPMailer(true);

    try {
        // Server settings
        $mail->isSMTP();
        $mail->Host = 'smtp.zoho.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'verify@agent-eq.com';
        $mail->Password = 'Y1hVSV4UH6BW';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;

        // Headers for better deliverability
        $mail->CharSet = 'UTF-8';
        $mail->Encoding = 'base64';
        $mail->addReplyTo('support@agent-eq.com', 'AgentEQ Support');

        // Recipients
        $mail->setFrom('verify@agent-eq.com', 'AgentEQ');
        $mail->addAddress($to, $first_name);

        // Subject
        $mail->Subject = '🔒 Confirm your AgentEQ account';

        // HTML Body (clean, responsive, elegant)
        $mail->isHTML(true);
        $mail->Body = "
        <html>
          <body style='background-color:#f9f9f9;padding:0;margin:0;'>
            <div style='max-width:600px;margin:40px auto;padding:30px;background:#ffffff;border:1px solid #e5e5e5;border-radius:10px;font-family:Helvetica,Arial,sans-serif;color:#333;'>
              <h2 style='color:#222;margin-bottom:20px;'>Welcome to AgentEQ, $first_name! 🎉</h2>
              <p style='font-size:16px;line-height:1.6;'>
                Thank you for signing up. Please confirm your email address by using the secure verification code below. This helps us keep your account safe.
              </p>
              <div style='margin:30px 0; text-align:center;'>
                <span style='font-size:28px; font-weight:bold; letter-spacing:2px; color:#005eff; background:#f0f4ff; padding:15px 25px; border-radius:8px; display:inline-block;'>
                  $token
                </span>
              </div>
              <p style='font-size:14px;color:#666;'>
                This code is valid for <strong>10 minutes</strong>. If you didn’t request this, you can safely ignore this email.
              </p>
              <hr style='border:none;border-top:1px solid #eee;margin:40px 0;' />
              <p style='font-size:12px;color:#999;text-align:center;'>
                AgentEQ – AI Automation Platform<br>
                Need help? <a href='mailto:support@agent-eq.com' style='color:#005eff;text-decoration:none;'>Contact Support</a>
              </p>
            </div>
          </body>
        </html>
        ";

        // Optional: plain text fallback
        $mail->AltBody = "Hi $first_name,\n\nYour AgentEQ verification code is: $token\n\nIf you didn’t request this, ignore this email.\n\n— The AgentEQ Team";

        // Send it!
        $mail->send();
        error_log("✅ Email sent to $to");
    } catch (Exception $e) {
        error_log('❌ Mailer Error: ' . $mail->ErrorInfo);
    }
}
