<?php
require_once '../../config.php';

// Check if user is authenticated and is an admin
requireRole('admin');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError('Method not allowed', 405);
}

$messageId = $_GET['id'] ?? null;

if (!$messageId) {
    sendError('Message ID is required', 400);
}

try {
    $pdo = getDBConnection();
    
    // Get the specific message
    $stmt = $pdo->prepare("
        SELECT id, name, email, company, message, is_read, created_at
        FROM contact_messages 
        WHERE id = ?
    ");
    $stmt->execute([$messageId]);
    $message = $stmt->fetch();
    
    if (!$message) {
        sendError('Message not found', 404);
    }
    
    sendResponse(['message' => $message]);
    
} catch (Exception $e) {
    error_log("Get message error: " . $e->getMessage());
    sendError('Failed to get message', 500);
}
?>
