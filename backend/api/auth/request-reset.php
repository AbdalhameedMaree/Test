<?php
require_once '../../config.php';
require_once '../../utils/mailer.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$email = $input['email'] ?? null;

if (!$email) {
    sendError('Email is required');
}

try {
    $pdo = getDBConnection();

    $stmt = $pdo->prepare("SELECT id, first_name FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        sendError("No user found with that email.");
    }

    $token = generateRandomToken();
    $expires_at = date('Y-m-d H:i:s', strtotime('+10 minutes'));

    $stmt = $pdo->prepare("UPDATE users SET verification_token = ?, verification_token_expires_at = ? WHERE id = ?");
    $stmt->execute([$token, $expires_at, $user['id']]);

    sendPasswordResetEmail($email, $user['first_name'], $token);

    sendResponse(['message' => 'Reset code sent to email.']);
} catch (PDOException $e) {
    sendError('Failed to process request: ' . $e->getMessage(), 500);
}
