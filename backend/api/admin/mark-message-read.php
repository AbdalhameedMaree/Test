<?php
require_once '../../config.php';

requireAuth();
$user = getCurrentUser();
if ($user['role'] !== 'admin') {
    sendError('Access denied', 403);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

$input = json_decode(file_get_contents('php://input'), true);

if (empty($input['message_id'])) {
    sendError('Message ID is required');
}

try {
    $pdo = getDBConnection();
    
    $stmt = $pdo->prepare("
        UPDATE contact_messages 
        SET is_read = 1 
        WHERE id = ?
    ");
    $stmt->execute([$input['message_id']]);
    
    if ($stmt->rowCount() === 0) {
        sendError('Message not found', 404);
    }
    
    sendResponse(['message' => 'Message marked as read']);
    
} catch (Exception $e) {
    error_log("Mark message read error: " . $e->getMessage());
    sendError('Failed to mark message as read', 500);
}
?>
