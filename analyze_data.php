<?php
require_once 'backend/config.php';

try {
    $pdo = getDBConnection();
    
    echo "<h2>Your Database Analysis</h2>\n";
    echo "<pre>\n";
    
    echo "=== Plans Table ===\n";
    $stmt = $pdo->query("SELECT * FROM plans");
    $plans = $stmt->fetchAll();
    foreach ($plans as $plan) {
        echo "Plan: {$plan['name']}, Price: \${$plan['price']}, Status: " . ($plan['is_active'] ?? 'active') . "\n";
    }
    
    echo "\n=== Subscriptions Table ===\n";
    $stmt = $pdo->query("SELECT COUNT(*) as total, status, COUNT(*) as count FROM subscriptions GROUP BY status");
    $subs = $stmt->fetchAll();
    foreach ($subs as $sub) {
        echo "Status: {$sub['status']}, Count: {$sub['count']}\n";
    }
    
    echo "\n=== Users Table ===\n";
    $stmt = $pdo->query("SELECT role, COUNT(*) as count FROM users GROUP BY role");
    $users = $stmt->fetchAll();
    foreach ($users as $user) {
        echo "Role: {$user['role']}, Count: {$user['count']}\n";
    }
    
    echo "\n=== Reviews Table ===\n";
    $stmt = $pdo->query("SELECT COUNT(*) as total, AVG(rating) as avg_rating FROM reviews WHERE is_approved = 1");
    $reviews = $stmt->fetch();
    echo "Total Reviews: {$reviews['total']}, Average Rating: " . round($reviews['avg_rating'], 1) . "\n";
    
    echo "\n=== Contact Messages ===\n";
    $stmt = $pdo->query("SELECT COUNT(*) as total, SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) as unread FROM contact_messages");
    $messages = $stmt->fetch();
    echo "Total Messages: {$messages['total']}, Unread: {$messages['unread']}\n";
    
    echo "\n=== Subscription Distribution Query Test ===\n";
    $stmt = $pdo->query("
        SELECT p.name, COUNT(s.id) as count
        FROM plans p
        LEFT JOIN subscriptions s ON p.id = s.plan_id AND s.status = 'active'
        GROUP BY p.id, p.name
        ORDER BY count DESC
    ");
    $distribution = $stmt->fetchAll();
    foreach ($distribution as $dist) {
        echo "Plan: {$dist['name']}, Active Subscriptions: {$dist['count']}\n";
    }
    
    echo "</pre>\n";
    
} catch (Exception $e) {
    echo "<h2>Error</h2>\n";
    echo "<pre>Error: " . $e->getMessage() . "</pre>\n";
}
?>
