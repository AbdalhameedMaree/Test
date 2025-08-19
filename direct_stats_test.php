<?php
require_once 'backend/config.php';

// Simple test - direct execution of get-statistics logic
try {
    $pdo = getDBConnection();
    
    echo "<h2>Direct Statistics Test (No Session Required)</h2>\n";
    echo "<pre>\n";
    
    // Test each query individually
    
    echo "=== 1. Total Users ===\n";
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM users");
    $totalUsers = $stmt->fetch()['total'];
    echo "Total Users: $totalUsers\n";
    
    echo "\n=== 2. Active Subscriptions ===\n";
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM subscriptions WHERE status = 'active'");
    $activeSubscriptions = $stmt->fetch()['total'];
    echo "Active Subscriptions: $activeSubscriptions\n";
    
    echo "\n=== 3. Total Revenue ===\n";
    $stmt = $pdo->query("SELECT COALESCE(SUM(amount), 0) as total FROM billing_history WHERE status = 'completed'");
    $totalRevenue = $stmt->fetch()['total'];
    echo "Total Revenue: \$$totalRevenue\n";
    
    echo "\n=== 4. Monthly Revenue ===\n";
    // Check which date column exists
    $columns = $pdo->query("SHOW COLUMNS FROM billing_history")->fetchAll();
    $dateColumn = 'created_at'; // Default
    
    foreach ($columns as $col) {
        if ($col['Field'] === 'billing_date') {
            $dateColumn = 'billing_date';
            break;
        }
    }
    
    echo "Using date column: $dateColumn\n";
    
    $stmt = $pdo->query("
        SELECT 
            DATE_FORMAT($dateColumn, '%Y-%m') as month,
            SUM(amount) as revenue
        FROM billing_history 
        WHERE status = 'completed' 
            AND $dateColumn >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT($dateColumn, '%Y-%m')
        ORDER BY month DESC
    ");
    $monthlyRevenue = $stmt->fetchAll();
    
    if (empty($monthlyRevenue)) {
        echo "No monthly revenue data found!\n";
        
        // Check what we have
        echo "\nLet's see what billing data exists:\n";
        $stmt = $pdo->query("SELECT $dateColumn, amount, status FROM billing_history ORDER BY $dateColumn DESC LIMIT 5");
        $recentBilling = $stmt->fetchAll();
        foreach ($recentBilling as $bill) {
            echo "Date: {$bill[$dateColumn]}, Amount: \${$bill['amount']}, Status: {$bill['status']}\n";
        }
    } else {
        foreach ($monthlyRevenue as $month) {
            echo "Month: {$month['month']}, Revenue: \${$month['revenue']}\n";
        }
    }
    
    echo "\n=== 5. Subscription Distribution ===\n";
    $stmt = $pdo->query("
        SELECT p.name, COUNT(s.id) as count
        FROM plans p
        LEFT JOIN subscriptions s ON p.id = s.plan_id AND s.status = 'active'
        GROUP BY p.id, p.name
        ORDER BY count DESC
    ");
    $subscriptionsByPlan = $stmt->fetchAll();
    
    foreach ($subscriptionsByPlan as $sub) {
        echo "Plan: {$sub['name']}, Count: {$sub['count']}\n";
    }
    
    echo "\n=== 6. Unread Messages ===\n";
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM contact_messages WHERE is_read = FALSE OR is_read = 0");
    $unreadMessages = $stmt->fetch()['total'];
    echo "Unread Messages: $unreadMessages\n";
    
    echo "\n=== 7. Average Rating ===\n";
    $stmt = $pdo->query("SELECT AVG(rating) as average_rating, COUNT(*) as total_reviews FROM reviews WHERE is_approved = TRUE OR is_approved = 1");
    $reviewStats = $stmt->fetch();
    echo "Average Rating: " . round((float)$reviewStats['average_rating'], 1) . "\n";
    echo "Total Reviews: {$reviewStats['total_reviews']}\n";
    
    echo "\n=== Summary JSON ===\n";
    $statistics = [
        'overview' => [
            'total_users' => (int)$totalUsers,
            'active_subscriptions' => (int)$activeSubscriptions,
            'total_revenue' => (float)$totalRevenue,
            'unread_messages' => (int)$unreadMessages,
            'new_users_this_month' => 0, // We'll calculate this separately
            'average_rating' => round((float)$reviewStats['average_rating'], 1),
            'total_reviews' => (int)$reviewStats['total_reviews']
        ],
        'monthly_revenue' => $monthlyRevenue,
        'subscriptions_by_plan' => $subscriptionsByPlan
    ];
    
    echo json_encode($statistics, JSON_PRETTY_PRINT);
    
    echo "</pre>\n";
    
} catch (Exception $e) {
    echo "<h2>Error</h2>\n";
    echo "<pre>Error: " . $e->getMessage() . "</pre>\n";
}
?>
