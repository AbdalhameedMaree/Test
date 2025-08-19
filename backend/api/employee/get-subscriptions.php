<?php
require_once '../../config.php';

// Check if user is employee or admin
requireAdminOrEmployee();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError('Method not allowed', 405);
}

try {
    $pdo = getDBConnection();
    
    // Get all customer subscriptions with user and plan info
    $stmt = $pdo->prepare("
        SELECT 
            us.id,
            us.status,
            us.start_date,
            us.end_date,
            us.conversations_used,
            CONCAT(u.first_name, ' ', u.last_name) as customer_name,
            u.email as customer_email,
            pb.name as plan_name,
            pb.price as plan_price,
            pb.monthly_conversations
        FROM user_subscriptions us
        JOIN users u ON us.user_id = u.id
        JOIN plan_bundles pb ON us.plan_id = pb.id
        WHERE u.role = 'customer'
        ORDER BY us.created_at DESC
    ");
    $stmt->execute();
    $subscriptions = $stmt->fetchAll();
    
    // Convert numeric fields
    foreach ($subscriptions as &$subscription) {
        $subscription['plan_price'] = (float) $subscription['plan_price'];
        $subscription['conversations_used'] = (int) $subscription['conversations_used'];
        $subscription['monthly_conversations'] = (int) $subscription['monthly_conversations'];
    }
    
    sendResponse(['subscriptions' => $subscriptions]);
    
} catch (PDOException $e) {
    sendError('Failed to fetch subscriptions: ' . $e->getMessage(), 500);
}
?>

