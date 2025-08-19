<?php
require_once '../../config.php';

// Check if user is admin
requireRole('admin');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

// Get input data
$input = json_decode(file_get_contents('php://input'), true);
$messageId = $input['id'] ?? null;

if (!$messageId) {
    sendError('Message ID is required', 400);
}

try {
    $pdo = getDBConnection();
    
    // Check if message exists
    $stmt = $pdo->prepare("SELECT id FROM contact_messages WHERE id = ?");
    $stmt->execute([$messageId]);
    $message = $stmt->fetch();
    
    if (!$message) {
        sendError('Message not found', 404);
    }
    
    // Delete the message
    $stmt = $pdo->prepare("DELETE FROM contact_messages WHERE id = ?");
    $stmt->execute([$messageId]);
    
    if ($stmt->rowCount() > 0) {
        sendResponse(['message' => 'Message deleted successfully']);
    } else {
        sendError('Failed to delete message', 500);
    }
    
} catch (PDOException $e) {
    error_log("Delete message error: " . $e->getMessage());
    sendError('Failed to delete message: ' . $e->getMessage(), 500);
}
?>
