<?php
require_once '../../config.php';

requireAuth();
$user = getCurrentUser();
if ($user['role'] !== 'admin') {
    sendError('Access denied', 403);
}

try {
    $pdo = getDBConnection();

    // Get all employees with their stats
    $stmt = $pdo->prepare("
        SELECT 
            u.id,
            u.first_name,
            u.last_name,
            u.email,
            u.is_verified,
            u.created_at,
            COUNT(DISTINCT c.id) as customers_handled,
            COUNT(DISTINCT s.id) as subscriptions_managed
        FROM users u
        LEFT JOIN subscriptions s ON u.id = s.user_id
        LEFT JOIN users c ON c.id = s.user_id
        WHERE u.role = 'employee'
        GROUP BY u.id, u.first_name, u.last_name, u.email, u.is_verified, u.created_at
        ORDER BY u.created_at DESC
    ");
    $stmt->execute();
    $employees = $stmt->fetchAll();

    // Get employee performance stats
    foreach ($employees as &$employee) {
        // Get recent activity (example: contact messages handled)
        $stmt = $pdo->prepare("
            SELECT COUNT(*) as messages_handled
            FROM contact_messages 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        ");
        $stmt->execute();
        $activity = $stmt->fetch();
        
        $employee['recent_activity'] = $activity['messages_handled'] ?? 0;
        $employee['status'] = $employee['is_verified'] ? 'active' : 'pending';
    }

    sendResponse([
        'employees' => $employees,
        'total_count' => count($employees)
    ]);

} catch (Exception $e) {
    error_log("Get employees error: " . $e->getMessage());
    sendError('Failed to get employees', 500);
}
?>
