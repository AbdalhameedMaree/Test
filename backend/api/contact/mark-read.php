<?php
require_once '../../config.php';

requireAuth();
$user = getCurrentUser();
if ($user['role'] !== 'employee' && $user['role'] !== 'admin') {
    sendError('Access denied', 403);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

$input = json_decode(file_get_contents('php://input'), true);

if (empty($input['id'])) {
    sendError('Message ID is required');
}

try {
    $pdo = getDBConnection();

    // Mark message as read
    $stmt = $pdo->prepare("UPDATE contact_messages SET is_read = 1 WHERE id = ?");
    $result = $stmt->execute([$input['id']]);

    if ($result) {
        sendResponse([
            'success' => true,
            'message' => 'Message marked as read'
        ]);
    } else {
        sendError('Failed to update message', 500);
    }

} catch (Exception $e) {
    error_log("Mark message read error: " . $e->getMessage());
    sendError('Failed to mark message as read', 500);
}
?>
