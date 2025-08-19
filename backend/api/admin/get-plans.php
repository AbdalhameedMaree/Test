<?php
require_once '../../config.php';

// Check if user is authenticated and is admin
requireAuth();
$user = getCurrentUser();
if ($user['role'] !== 'admin') {
    sendError('Access denied', 403);
}

try {
    $pdo = getDBConnection();
    
    $stmt = $pdo->prepare("
        SELECT id, name, description, price, billing_period, features, 
               max_conversations, max_tokens, is_active, created_at, updated_at
        FROM plans 
        ORDER BY price ASC, billing_period ASC
    ");
    $stmt->execute();
    $plans = $stmt->fetchAll();
    
    // Decode JSON features for each plan
    foreach ($plans as &$plan) {
        $plan['features'] = json_decode($plan['features'], true);
    }
    
    sendResponse(['plans' => $plans]);
    
} catch (Exception $e) {
    sendError('Failed to fetch plans: ' . $e->getMessage(), 500);
}
?>

