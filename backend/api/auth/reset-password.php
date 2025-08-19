<?php
require_once __DIR__ . '/../../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

$data = json_decode(file_get_contents('php://input'), true);
$email = $data['email'] ?? null;
$token = $data['token'] ?? null;
$newPassword = $data['new_password'] ?? null;

if (!$email || !$token || !$newPassword) {
    sendError('Missing required fields');
}

try {
    $pdo = getDBConnection();

    // Check user and token (valid and not expired)
    $stmt = $pdo->prepare("SELECT id, verification_token_expires_at FROM users WHERE email = ? AND verification_token = ?");
    $stmt->execute([$email, $token]);
    $user = $stmt->fetch();

    if (!$user) {
        sendError('Invalid email or token.');
    }

    $expires = strtotime($user['verification_token_expires_at']);
    if (!$expires || time() > $expires) {
        sendError('Token has expired. Please request a new one.');
    }

    // Update password + remove token
    $passwordHash = password_hash($newPassword, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("UPDATE users SET password_hash = ?, verification_token = NULL, verification_token_expires_at = NULL WHERE email = ?");
    $stmt->execute([$passwordHash, $email]);

    sendResponse(['message' => 'Password changed successfully.']);
} catch (PDOException $e) {
    sendError('Reset failed: ' . $e->getMessage(), 500);
}
