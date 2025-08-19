<?php
require_once '../../config.php';

requireAuth();
$user = getCurrentUser();
if ($user['role'] !== 'admin') {
    sendError('Access denied', 403);
}

try {
    $pdo = getDBConnection();

    // Get all contact messages with stats
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
        LIMIT 100
    ");
    $stmt->execute();
    $messages = $stmt->fetchAll();

    // Get message statistics
    $stmt = $pdo->prepare("
        SELECT 
            COUNT(*) as total_messages,
            COUNT(CASE WHEN is_read = 0 THEN 1 END) as unread_messages,
            COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as recent_messages
        FROM contact_messages
    ");
    $stmt->execute();
    $stats = $stmt->fetch();

    sendResponse([
        'messages' => $messages,
        'stats' => $stats
    ]);

} catch (Exception $e) {
    error_log("Get messages error: " . $e->getMessage());
    sendError('Failed to get contact messages', 500);
}
?>
