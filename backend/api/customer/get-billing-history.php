<?php
require_once '../../config.php';

// Check if user is customer
requireRole('customer');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError('Method not allowed', 405);
}

try {
    $pdo = getDBConnection();
    $user = getCurrentUser();
    
    // Get billing history (mock data for now)
    // In a real application, you would have a billing_history table
    $stmt = $pdo->prepare("
        SELECT 
            us.id,
            us.start_date as date,
            pb.name as plan_name,
            pb.price as amount,
            'paid' as status
        FROM user_subscriptions us
        JOIN plan_bundles pb ON us.plan_id = pb.id
        WHERE us.user_id = ?
        ORDER BY us.start_date DESC
        LIMIT 12
    ");
    $stmt->execute([$user['id']]);
    $billing = $stmt->fetchAll();
    
    // Convert numeric fields
    foreach ($billing as &$bill) {
        $bill['amount'] = (float) $bill['amount'];
    }
    
    sendResponse(['billing' => $billing]);
    
} catch (PDOException $e) {
    sendError('Failed to fetch billing history: ' . $e->getMessage(), 500);
}
?>

