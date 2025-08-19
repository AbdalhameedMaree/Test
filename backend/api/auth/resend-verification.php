<?php
require_once '../../config.php';
require_once '../../utils/mailer.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$user_id = $input['user_id'] ?? null;

if (!$user_id) {
    sendError('Missing user ID');
}

try {
    $pdo = getDBConnection();

    $stmt = $pdo->prepare("SELECT first_name, email, last_verification_sent_at FROM users WHERE id = ?");
    $stmt->execute([$user_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        sendError('User not found');
    }

    $last_sent = strtotime($user['last_verification_sent_at']);
    $now = time();
    if ($now - $last_sent < 60) {
        sendError('Please wait before requesting a new code');
    }

    $token = generateRandomToken();
    $expires_at = date('Y-m-d H:i:s', strtotime('+10 minutes'));
    $nowFormatted = date('Y-m-d H:i:s');

    $stmt = $pdo->prepare("UPDATE users SET verification_token = ?, verification_token_expires_at = ?, last_verification_sent_at = ? WHERE id = ?");
    $stmt->execute([$token, $expires_at, $nowFormatted, $user_id]);

    sendVerificationEmail($user['email'], $user['first_name'], $token);

    sendResponse(['message' => 'Verification code resent successfully.']);

} catch (PDOException $e) {
    sendError('Resend failed: ' . $e->getMessage(), 500);
}
?>