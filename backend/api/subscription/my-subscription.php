<?php
require_once '../../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError('Method not allowed', 405);
}

requireAuth();

$user_id = $_SESSION['user_id'];

try {
    $pdo = getDBConnection();
    
    // Get user's active subscription
    $stmt = $pdo->prepare("
        SELECT 
            s.id as subscription_id,
            s.status,
            s.start_date,
            uu.conversations_used,
            uu.tokens_used
        FROM subscriptions s
        LEFT JOIN user_usage uu ON s.user_id = uu.user_id AND DATE_FORMAT(s.start_date, '%Y-%m') = uu.month_year
        WHERE s.user_id = ? AND s.status = 'active'
        ORDER BY s.created_at DESC
        LIMIT 1
    ");
    $stmt->execute([$user_id]);
    $subscription = $stmt->fetch();
    
    if ($subscription) {
        // Since plans are now static in HTML, we'll need to fetch plan details from a static source or assume them.
        // For now, we'll just return the subscription and usage data.
        // In a real application, you might have a client-side lookup for plan details based on a plan_id if needed.
        
        $response = [
            'subscription' => $subscription,
            'usage' => [
                'conversations_used' => (int)$subscription['conversations_used'],
                'tokens_used' => (int)$subscription['tokens_used']
            ]
        ];
    } else {
        $response = [
            'subscription' => null,
            'usage' => [
                'conversations_used' => 0,
                'tokens_used' => 0
            ]
        ];
    }
    
    sendResponse($response);
    
} catch (PDOException $e) {
    sendError('Failed to fetch subscription: ' . $e->getMessage(), 500);
}
?>


