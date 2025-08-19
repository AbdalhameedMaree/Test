<?php
require_once '../../config.php';

// Check if user is admin
requireRole('admin');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError('Method not allowed', 405);
}

try {
    $pdo = getDBConnection();
    
    // Get all users with their subscription info
    $stmt = $pdo->prepare("
        SELECT 
            u.id, 
            u.first_name, 
            u.last_name, 
            u.email, 
            u.role, 
            u.is_verified, 
            u.created_at,
            p.name as current_plan
        FROM users u
        LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
        LEFT JOIN plans p ON s.plan_id = p.id
        ORDER BY u.created_at DESC
    ");
    $stmt->execute();
    $users = $stmt->fetchAll();
    
    // Convert boolean fields
    foreach ($users as &$user) {
        $user['is_verified'] = (bool) $user['is_verified'];
    }
    
    sendResponse(['users' => $users]);
    
} catch (PDOException $e) {
    sendError('Failed to fetch users: ' . $e->getMessage(), 500);
}
?>

