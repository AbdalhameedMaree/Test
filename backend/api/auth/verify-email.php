<?php
require_once '../../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$user_id = $input['user_id'] ?? null;
$token = $input['token'] ?? null;

if (!$user_id || !$token) {
    sendError('Missing user ID or token');
}

try {
    $pdo = getDBConnection();

    $stmt = $pdo->prepare("
        SELECT id, verification_token_expires_at 
        FROM users 
        WHERE id = ? AND verification_token = ?
    ");
    $stmt->execute([$user_id, $token]);
    $user = $stmt->fetch();

    if (!$user) {
        sendError('Invalid token or user ID');
    }

    if (strtotime($user['verification_token_expires_at']) < time()) {
        sendError('Verification token has expired');
    }

    $stmt = $pdo->prepare("UPDATE users SET is_verified = 1, verification_token = NULL, verification_token_expires_at = NULL WHERE id = ?");
    $stmt->execute([$user_id]);

    sendResponse(['message' => 'Email verified successfully']);

} catch (PDOException $e) {
    sendError('Verification failed: ' . $e->getMessage(), 500);
}

?>
