<?php
require_once '../../config.php';

// Check if user is authenticated
requireAuth();
$user = getCurrentUser();

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['plan_id'])) {
    sendError('Plan ID is required');
}

try {
    $pdo = getDBConnection();
    
    // Get plan details
    $stmt = $pdo->prepare("SELECT * FROM plans WHERE id = ? AND is_active = TRUE");
    $stmt->execute([$input['plan_id']]);
    $plan = $stmt->fetch();
    
    if (!$plan) {
        sendError('Plan not found or inactive', 404);
    }
    
    // Create a checkout session (simplified for demo)
    $checkoutSession = [
        'id' => 'cs_' . uniqid(),
        'plan_id' => $plan['id'],
        'plan_name' => $plan['name'],
        'amount' => $plan['price'],
        'currency' => 'USD',
        'user_id' => $user['id'],
        'status' => 'pending',
        'created_at' => date('Y-m-d H:i:s'),
        'expires_at' => date('Y-m-d H:i:s', strtotime('+1 hour'))
    ];
    
    // In a real implementation, you would integrate with Stripe, PayPal, etc.
    // For demo purposes, we'll create a simple checkout URL
    $checkoutUrl = "payment-checkout.html?session=" . $checkoutSession['id'] . 
                   "&plan=" . urlencode($plan['name']) . 
                   "&amount=" . $plan['price'];
    
    sendResponse([
        'checkout_url' => $checkoutUrl,
        'session_id' => $checkoutSession['id'],
        'plan' => $plan
    ]);
    
} catch (Exception $e) {
    sendError('Failed to create checkout session: ' . $e->getMessage(), 500);
}
?>

