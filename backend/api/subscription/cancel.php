<?php
require_once '../../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

requireAuth();

$user_id = $_SESSION['user_id'];

try {
    $pdo = getDBConnection();
    
    // Find user's active subscription
    $stmt = $pdo->prepare("SELECT id FROM user_subscriptions WHERE user_id = ? AND status = 'active'");
    $stmt->execute([$user_id]);
    $subscription = $stmt->fetch();
    
    if (!$subscription) {
        sendError('No active subscription found');
    }
    
    // Cancel subscription
    $stmt = $pdo->prepare("UPDATE user_subscriptions SET status = 'cancelled', end_date = NOW() WHERE id = ?");
    $stmt->execute([$subscription['id']]);
    
    sendResponse([
        'message' => 'Subscription cancelled successfully'
    ]);
    
} catch (PDOException $e) {
    sendError('Cancellation failed: ' . $e->getMessage(), 500);
}
?>

