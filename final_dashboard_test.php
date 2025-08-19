<?php
require_once 'backend/config.php';

try {
    $pdo = getDBConnection();
    
    echo "<h2>Complete Dashboard Test Results</h2>\n";
    echo "<pre>\n";
    
    // Test 1: Database Connection
    echo "1. DATABASE CONNECTION: ✅ Connected\n\n";
    
    // Test 2: Statistics API
    echo "2. STATISTICS API TEST:\n";
    echo "Making request to backend/api/admin/get-statistics.php...\n";
    
    $url = 'http://localhost:8080/backend/api/admin/get-statistics.php';
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, false);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "Response Code: $httpCode\n";
    
    if ($response) {
        $data = json_decode($response, true);
        if ($data) {
            echo "✅ API Response received\n";
            echo "Total Revenue: \${$data['totalRevenue']}\n";
            echo "Total Users: {$data['totalUsers']}\n";
            echo "Active Subscriptions: {$data['activeSubscriptions']}\n";
            echo "Monthly Revenue entries: " . count($data['monthlyRevenue']) . "\n";
            echo "Plan Performance entries: " . count($data['planPerformance']) . "\n";
            echo "Subscription Distribution entries: " . count($data['subscriptionDistribution']) . "\n";
        } else {
            echo "❌ Invalid JSON response\n";
            echo "Raw response: " . substr($response, 0, 500) . "...\n";
        }
    } else {
        echo "❌ No response from API\n";
    }
    
    // Test 3: Direct Database Queries
    echo "\n3. DIRECT DATABASE QUERIES:\n";
    
    // Billing history
    $stmt = $pdo->query("SELECT COUNT(*) as count, SUM(amount) as total FROM billing_history WHERE status = 'completed'");
    $billing = $stmt->fetch();
    echo "Billing Records: {$billing['count']} | Total Revenue: \${$billing['total']}\n";
    
    // Users
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
    $users = $stmt->fetch();
    echo "Total Users: {$users['count']}\n";
    
    // Active subscriptions
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM subscriptions WHERE status = 'active'");
    $subs = $stmt->fetch();
    echo "Active Subscriptions: {$subs['count']}\n";
    
    // Plans
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM plans");
    $plans = $stmt->fetch();
    echo "Total Plans: {$plans['count']}\n";
    
    // Test 4: Chart Data Generation
    echo "\n4. CHART DATA GENERATION:\n";
    
    // Monthly revenue for last 6 months
    $stmt = $pdo->query("
        SELECT 
            DATE_FORMAT(created_at, '%M %Y') as month,
            SUM(amount) as revenue
        FROM billing_history 
        WHERE status = 'completed' 
        AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY DATE_FORMAT(created_at, '%Y-%m') ASC
    ");
    $monthlyData = $stmt->fetchAll();
    echo "Monthly Revenue Data Points: " . count($monthlyData) . "\n";
    foreach ($monthlyData as $month) {
        echo "  - {$month['month']}: \${$month['revenue']}\n";
    }
    
    // Subscription distribution
    $stmt = $pdo->query("
        SELECT 
            p.name,
            COUNT(s.id) as subscription_count
        FROM plans p
        LEFT JOIN subscriptions s ON p.id = s.plan_id AND s.status = 'active'
        GROUP BY p.id, p.name
        HAVING subscription_count > 0
        ORDER BY subscription_count DESC
    ");
    $distributionData = $stmt->fetchAll();
    echo "\nSubscription Distribution Data Points: " . count($distributionData) . "\n";
    foreach ($distributionData as $dist) {
        echo "  - {$dist['name']}: {$dist['subscription_count']} subscriptions\n";
    }
    
    // Plan performance
    $stmt = $pdo->query("
        SELECT 
            p.name,
            p.price,
            COUNT(s.id) as subscription_count,
            COALESCE(SUM(bh.amount), 0) as total_revenue
        FROM plans p
        LEFT JOIN subscriptions s ON p.id = s.plan_id AND s.status = 'active'
        LEFT JOIN billing_history bh ON s.id = bh.subscription_id AND bh.status = 'completed'
        GROUP BY p.id, p.name, p.price
        ORDER BY subscription_count DESC, total_revenue DESC
    ");
    $performanceData = $stmt->fetchAll();
    echo "\nPlan Performance Data Points: " . count($performanceData) . "\n";
    foreach ($performanceData as $perf) {
        echo "  - {$perf['name']}: {$perf['subscription_count']} subs, \${$perf['total_revenue']} revenue\n";
    }
    
    echo "\n5. DASHBOARD READINESS:\n";
    
    $readiness = [];
    $readiness[] = ($billing['count'] > 0) ? "✅ Billing data available" : "❌ No billing data";
    $readiness[] = ($users['count'] > 0) ? "✅ User data available" : "❌ No users";
    $readiness[] = ($subs['count'] > 0) ? "✅ Subscription data available" : "❌ No subscriptions";
    $readiness[] = (count($monthlyData) > 0) ? "✅ Monthly revenue chart ready" : "❌ No monthly revenue data";
    $readiness[] = (count($distributionData) > 0) ? "✅ Subscription distribution chart ready" : "❌ No distribution data";
    $readiness[] = (count($performanceData) > 0) ? "✅ Plan performance chart ready" : "❌ No performance data";
    
    foreach ($readiness as $check) {
        echo "$check\n";
    }
    
    $allGood = !in_array(false, array_map(function($item) { return strpos($item, '✅') !== false; }, $readiness));
    
    if ($allGood) {
        echo "\n🎉 DASHBOARD IS READY! All charts should display with real data.\n";
    } else {
        echo "\n⚠️  Some issues detected. Consider running add_billing_data.php first.\n";
    }
    
    echo "</pre>\n";
    
    echo "<br><a href='add_billing_data.php' style='background: #f59e0b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px;'>Add Sample Billing Data</a>";
    echo " <a href='admin_login_test.php' style='background: #00d4ff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; margin-left: 10px;'>Login as Admin</a>";
    echo " <a href='admin-dashboard.html' style='background: #7c3aed; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; margin-left: 10px;'>View Dashboard</a>";
    
} catch (Exception $e) {
    echo "<h2>Error</h2>\n";
    echo "<pre>Error: " . $e->getMessage() . "</pre>\n";
}
?>
