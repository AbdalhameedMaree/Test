<?php
require_once '../../config.php';

requireAuth();
$user = getCurrentUser();
if ($user['role'] !== 'employee' && $user['role'] !== 'admin') {
    sendError('Access denied', 403);
}

try {
    $pdo = getDBConnection();

    // Get employee statistics
    $stats = [];

    // Total customers
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM users WHERE role = 'customer'");
    $stats['total_customers'] = $stmt->fetch()['count'];

    // Active subscriptions
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM subscriptions WHERE status = 'active'");
    $stats['active_subscriptions'] = $stmt->fetch()['count'];

    // Total revenue this month
    $stmt = $pdo->query("
        SELECT COALESCE(SUM(amount), 0) as revenue 
        FROM billing_history 
        WHERE status = 'completed' 
        AND MONTH(billing_date) = MONTH(NOW()) 
        AND YEAR(billing_date) = YEAR(NOW())
    ");
    $stats['monthly_revenue'] = $stmt->fetch()['revenue'];

    // Pending contact messages
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM contact_messages WHERE is_read = 0");
    $stats['pending_messages'] = $stmt->fetch()['count'];

    // Recent signups (last 7 days)
    $stmt = $pdo->query("
        SELECT COUNT(*) as count 
        FROM users 
        WHERE role = 'customer' 
        AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    ");
    $stats['recent_signups'] = $stmt->fetch()['count'];

    // Subscription trends (last 6 months)
    $stmt = $pdo->query("
        SELECT 
            DATE_FORMAT(created_at, '%Y-%m') as month,
            COUNT(*) as subscriptions
        FROM subscriptions 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month ASC
    ");
    $trends = $stmt->fetchAll();

    // Revenue by plan
    $stmt = $pdo->query("
        SELECT 
            p.name as plan_name,
            COUNT(s.id) as subscription_count,
            SUM(p.price) as total_revenue
        FROM plans p
        LEFT JOIN subscriptions s ON p.id = s.plan_id AND s.status = 'active'
        WHERE p.is_active = 1
        GROUP BY p.id, p.name
        ORDER BY total_revenue DESC
    ");
    $planStats = $stmt->fetchAll();

    sendResponse([
        'statistics' => $stats,
        'subscription_trends' => $trends,
        'plan_statistics' => $planStats
    ]);

} catch (Exception $e) {
    error_log("Employee statistics error: " . $e->getMessage());
    sendError('Failed to get statistics', 500);
}
?>
