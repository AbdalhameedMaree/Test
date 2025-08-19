<?php
require_once '../../config.php';

// Check if user is employee or admin
requireAdminOrEmployee();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError('Method not allowed', 405);
}

try {
    $pdo = getDBConnection();
    
    // Get all customers with their subscription info
    $stmt = $pdo->prepare("
        SELECT 
            u.id, 
            u.first_name, 
            u.last_name, 
            u.email, 
            u.is_verified, 
            u.created_at,
            pb.name as current_plan
        FROM users u
        LEFT JOIN user_subscriptions us ON u.id = us.user_id AND us.status = 'active'
        LEFT JOIN plan_bundles pb ON us.plan_id = pb.id
        WHERE u.role = 'customer'
        ORDER BY u.created_at DESC
    ");
    $stmt->execute();
    $customers = $stmt->fetchAll();
    
    // Convert boolean fields
    foreach ($customers as &$customer) {
        $customer['is_verified'] = (bool) $customer['is_verified'];
    }
    
    sendResponse(['customers' => $customers]);
    
} catch (PDOException $e) {
    sendError('Failed to fetch customers: ' . $e->getMessage(), 500);
}
?>

