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
    
    // Get total users count
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM users");
    $totalUsers = $stmt->fetch()['total'];
    
    // Get users by role
    $stmt = $pdo->query("
        SELECT role, COUNT(*) as count 
        FROM users 
        GROUP BY role
    ");
    $usersByRole = [];
    while ($row = $stmt->fetch()) {
        $usersByRole[$row['role']] = $row['count'];
    }
    
    // Get active subscriptions
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM subscriptions WHERE status = 'active'");
    $activeSubscriptions = $stmt->fetch()['total'];
    
    // Get total revenue (from billing history) - handle empty table gracefully
    $stmt = $pdo->query("
        SELECT COALESCE(SUM(amount), 0) as total 
        FROM billing_history 
        WHERE status = 'completed'
    ");
    $totalRevenue = (float)$stmt->fetch()['total'];
    
    // Get monthly revenue for the last 6 months - generate all months with data
    $dateColumn = 'created_at'; // Default
    
    // Check which date column exists
    $columns = $pdo->query("SHOW COLUMNS FROM billing_history")->fetchAll();
    $hasCreatedAt = false;
    $hasBillingDate = false;
    
    foreach ($columns as $col) {
        if ($col['Field'] === 'created_at') $hasCreatedAt = true;
        if ($col['Field'] === 'billing_date') $hasBillingDate = true;
    }
    
    // Use the appropriate date column
    if ($hasBillingDate) {
        $dateColumn = 'billing_date';
    } elseif ($hasCreatedAt) {
        $dateColumn = 'created_at';
    }
    
    // Get monthly revenue data - show actual months with data
    $stmt = $pdo->query("
        SELECT 
            DATE_FORMAT($dateColumn, '%Y-%m') as month,
            SUM(amount) as revenue
        FROM billing_history 
        WHERE status = 'completed'
        GROUP BY DATE_FORMAT($dateColumn, '%Y-%m')
        ORDER BY month ASC
    ");
    $monthlyRevenue = $stmt->fetchAll();
    
    // Convert to proper format
    foreach ($monthlyRevenue as &$month) {
        $month['revenue'] = (float)$month['revenue'];
    }
    unset($month);
    
    // If no data, show last 6 months with zero values
    if (empty($monthlyRevenue)) {
        $monthlyRevenue = [];
        $currentDate = new DateTime();
        
        for ($i = 5; $i >= 0; $i--) {
            $date = clone $currentDate;
            $date->modify("-$i month");
            $monthlyRevenue[] = [
                'month' => $date->format('Y-m'),
                'revenue' => 0
            ];
        }
    }
    
    // Get unread messages
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM contact_messages WHERE is_read = FALSE");
    $unreadMessages = $stmt->fetch()['total'];
    
    // Get subscription distribution by plan
    $stmt = $pdo->query("
        SELECT p.name, COUNT(s.id) as count
        FROM plans p
        LEFT JOIN subscriptions s ON p.id = s.plan_id AND s.status = 'active'
        GROUP BY p.id, p.name
        ORDER BY count DESC
    ");
    $subscriptionsByPlan = $stmt->fetchAll();
    
    // Get recent user registrations (last 30 days)
    $stmt = $pdo->query("
        SELECT COUNT(*) as total 
        FROM users 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    ");
    $newUsersThisMonth = $stmt->fetch()['total'];
    
    // Get average rating from reviews
    $stmt = $pdo->query("
        SELECT 
            AVG(rating) as average_rating,
            COUNT(*) as total_reviews
        FROM reviews 
        WHERE is_approved = TRUE
    ");
    $reviewStats = $stmt->fetch();
    
    // Get top performing plans - show subscription counts even without billing data
    $stmt = $pdo->query("
        SELECT 
            p.name,
            COUNT(s.id) as subscriptions,
            COALESCE(SUM(bh.amount), 0) as revenue,
            p.price as plan_price
        FROM plans p
        LEFT JOIN subscriptions s ON p.id = s.plan_id AND s.status = 'active'
        LEFT JOIN billing_history bh ON s.id = bh.subscription_id AND bh.status = 'completed'
        WHERE p.is_active = 1
        GROUP BY p.id, p.name, p.price
        ORDER BY subscriptions DESC, revenue DESC
    ");
    $planPerformance = $stmt->fetchAll();
    
    // If no billing data, estimate revenue from subscriptions and plan prices
    if ($totalRevenue == 0) {
        foreach ($planPerformance as &$plan) {
            if ($plan['revenue'] == 0 && $plan['subscriptions'] > 0) {
                // Estimate monthly revenue as subscriptions * plan_price
                $plan['revenue'] = $plan['subscriptions'] * $plan['plan_price'];
            }
        }
        unset($plan);
    }
    
    $statistics = [
        'overview' => [
            'total_users' => (int)$totalUsers,
            'active_subscriptions' => (int)$activeSubscriptions,
            'total_revenue' => (float)$totalRevenue,
            'unread_messages' => (int)$unreadMessages,
            'new_users_this_month' => (int)$newUsersThisMonth,
            'average_rating' => round((float)$reviewStats['average_rating'], 1),
            'total_reviews' => (int)$reviewStats['total_reviews']
        ],
        'users_by_role' => $usersByRole,
        'monthly_revenue' => $monthlyRevenue,
        'subscriptions_by_plan' => $subscriptionsByPlan,
        'plan_performance' => $planPerformance
    ];
    
    sendResponse(['statistics' => $statistics]);
    
} catch (Exception $e) {
    sendError('Failed to fetch statistics: ' . $e->getMessage(), 500);
}
?>

