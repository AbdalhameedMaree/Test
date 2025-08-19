<?php
require_once 'backend/config.php';

try {
    $pdo = getDBConnection();
    
    echo "<h2>Monthly Revenue Debug</h2>\n";
    echo "<pre>\n";
    
    // Check what billing data we have
    echo "=== BILLING HISTORY DATA ===\n";
    $stmt = $pdo->query("
        SELECT 
            id,
            user_id,
            subscription_id,
            amount,
            status,
            created_at,
            DATE_FORMAT(created_at, '%Y-%m') as month
        FROM billing_history 
        WHERE status = 'completed'
        ORDER BY created_at DESC
    ");
    $billingData = $stmt->fetchAll();
    
    foreach ($billingData as $row) {
        echo "ID: {$row['id']} | User: {$row['user_id']} | Amount: \${$row['amount']} | Month: {$row['month']} | Date: {$row['created_at']}\n";
    }
    
    echo "\n=== MONTHLY REVENUE QUERY ===\n";
    $stmt = $pdo->query("
        SELECT 
            DATE_FORMAT(created_at, '%Y-%m') as month,
            COALESCE(SUM(amount), 0) as revenue,
            COUNT(*) as payment_count
        FROM billing_history 
        WHERE status = 'completed' 
            AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month DESC
        LIMIT 12
    ");
    $monthlyRevenue = $stmt->fetchAll();
    
    echo "Found " . count($monthlyRevenue) . " months of data:\n";
    foreach ($monthlyRevenue as $row) {
        echo "Month: {$row['month']} | Revenue: \${$row['revenue']} | Payments: {$row['payment_count']}\n";
    }
    
    echo "\n=== FORMATTED FOR CHART ===\n";
    $chartData = [];
    foreach ($monthlyRevenue as $row) {
        $chartData[] = [
            'month' => $row['month'],
            'revenue' => (float)$row['revenue']
        ];
    }
    
    echo "Chart Data JSON:\n";
    echo json_encode($chartData, JSON_PRETTY_PRINT);
    
    echo "\n=== TEST GET-STATISTICS API ===\n";
    
    // Simulate the same query from get-statistics.php
    $stmt = $pdo->query("
        SELECT 
            DATE_FORMAT(created_at, '%Y-%m') as month,
            COALESCE(SUM(amount), 0) as revenue
        FROM billing_history 
        WHERE status = 'completed' 
            AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month DESC
        LIMIT 12
    ");
    $apiData = $stmt->fetchAll();
    
    echo "API would return:\n";
    echo json_encode($apiData, JSON_PRETTY_PRINT);
    
    echo "</pre>\n";
    
} catch (Exception $e) {
    echo "<h2>Error</h2>\n";
    echo "<pre>Error: " . $e->getMessage() . "</pre>\n";
}
?>
