<?php
require_once '../../config.php';

requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (empty($input['session_id'])) {
    sendError('Session ID is required');
}

try {
    $pdo = getDBConnection();
    $user = getCurrentUser();
    
    if (!$user) {
        sendError('User not found', 404);
    }

    // In a real implementation, you would verify the payment with Stripe
    // For now, we'll simulate a successful payment confirmation
    
    $sessionId = $input['session_id'];
    $planId = $input['plan_id'] ?? null;
    
    if (!$planId) {
        sendError('Plan ID is required');
    }

    // Get plan details
    $stmt = $pdo->prepare("SELECT * FROM plans WHERE id = ? AND is_active = 1");
    $stmt->execute([$planId]);
    $plan = $stmt->fetch();
    
    if (!$plan) {
        sendError('Invalid plan', 404);
    }

    // Start transaction
    $pdo->beginTransaction();

    try {
        // Cancel any existing active subscriptions
        $stmt = $pdo->prepare("
            UPDATE subscriptions 
            SET status = 'cancelled', end_date = NOW() 
            WHERE user_id = ? AND status = 'active'
        ");
        $stmt->execute([$user['id']]);

        // Create new subscription
        $endDate = $plan['billing_period'] === 'yearly' ? 
            date('Y-m-d H:i:s', strtotime('+1 year')) : 
            date('Y-m-d H:i:s', strtotime('+1 month'));

        $stmt = $pdo->prepare("
            INSERT INTO subscriptions (user_id, plan_id, status, start_date, end_date) 
            VALUES (?, ?, 'active', NOW(), ?)
        ");
        $stmt->execute([$user['id'], $planId, $endDate]);
        $subscriptionId = $pdo->lastInsertId();

        // Record billing history
        $stmt = $pdo->prepare("
            INSERT INTO billing_history (user_id, subscription_id, amount, currency, payment_method, transaction_id, status) 
            VALUES (?, ?, ?, 'USD', 'Credit Card', ?, 'completed')
        ");
        $stmt->execute([$user['id'], $subscriptionId, $plan['price'], $sessionId]);

        $pdo->commit();

        sendResponse([
            'success' => true,
            'message' => 'Payment confirmed and subscription activated',
            'subscription' => [
                'id' => $subscriptionId,
                'plan_name' => $plan['name'],
                'status' => 'active',
                'start_date' => date('Y-m-d H:i:s'),
                'end_date' => $endDate,
                'amount' => $plan['price']
            ]
        ]);

    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }

} catch (Exception $e) {
    error_log("Payment confirmation error: " . $e->getMessage());
    sendError('Payment confirmation failed: ' . $e->getMessage(), 500);
}
?>
