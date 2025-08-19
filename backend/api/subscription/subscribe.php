<?php
require_once '../../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

requireAuth();

$input = json_decode(file_get_contents('php://input'), true);

// Validate input
if (empty($input['plan_type'])) {
    sendError('Plan type is required');
}

$plan_type = $input['plan_type'];
$user_id = $_SESSION['user_id'];

try {
    $pdo = getDBConnection();
    
    // Get plan details
    $stmt = $pdo->prepare("SELECT id, name, price, monthly_conversations FROM plan_bundles WHERE name = ? AND is_active = TRUE");
    $stmt->execute([$plan_type]);
    $plan = $stmt->fetch();
    
    if (!$plan) {
        sendError('Invalid plan type');
    }
    
    // Check if user already has an active subscription
    $stmt = $pdo->prepare("SELECT id FROM user_subscriptions WHERE user_id = ? AND status = 'active'");
    $stmt->execute([$user_id]);
    $existing_subscription = $stmt->fetch();
    
    if ($existing_subscription) {
        // Cancel existing subscription
        $stmt = $pdo->prepare("UPDATE user_subscriptions SET status = 'cancelled', end_date = NOW() WHERE id = ?");
        $stmt->execute([$existing_subscription['id']]);
    }
    
    // Create new subscription
    $stmt = $pdo->prepare("
        INSERT INTO user_subscriptions (user_id, plan_id, status, start_date) 
        VALUES (?, ?, 'active', NOW())
    ");
    $stmt->execute([$user_id, $plan['id']]);
    
    sendResponse([
        'message' => 'Subscription successful',
        'plan' => $plan
    ]);
    
} catch (PDOException $e) {
    sendError('Subscription failed: ' . $e->getMessage(), 500);
}
?>

