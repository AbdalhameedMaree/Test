<?php
require_once '../../config.php';

// Check if user is admin or employee
requireAdminOrEmployee();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError('Method not allowed', 405);
}

try {
    $pdo = getDBConnection();
    
    // Get all contact messages
    $stmt = $pdo->prepare("
        SELECT 
            id,
            name,
            email,
            company,
            message,
            is_read,
            created_at
        FROM contact_messages
        ORDER BY created_at DESC
    ");
    $stmt->execute();
    $messages = $stmt->fetchAll();
    
    // Convert boolean fields
    foreach ($messages as &$message) {
        $message['is_read'] = (bool) $message['is_read'];
    }
    
    sendResponse(['messages' => $messages]);
    
} catch (PDOException $e) {
    sendError('Failed to fetch messages: ' . $e->getMessage(), 500);
}
?>

