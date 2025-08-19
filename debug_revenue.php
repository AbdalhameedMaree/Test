<?php
require_once 'backend/config.php';

try {
    $pdo = getDBConnection();
    
    echo "<h2>Database Revenue Debugging</h2>\n";
    echo "<pre>\n";
    
    // Check billing_history table structure
    echo "=== Billing History Table Structure ===\n";
    $stmt = $pdo->query("DESCRIBE billing_history");
    while ($row = $stmt->fetch()) {
        echo "{$row['Field']} - {$row['Type']} - {$row['Null']} - {$row['Key']} - {$row['Default']}\n";
    }
    
    echo "\n=== All Billing History Records ===\n";
    $stmt = $pdo->query("SELECT * FROM billing_history ORDER BY created_at DESC");
    $records = $stmt->fetchAll();
    
    if (empty($records)) {
        echo "NO BILLING RECORDS FOUND!\n";
    } else {
        foreach ($records as $record) {
            echo "ID: {$record['id']}, Amount: \${$record['amount']}, Status: {$record['status']}, Date: {$record['created_at']}\n";
        }
    }
    
    echo "\n=== Revenue Totals ===\n";
    $stmt = $pdo->query("SELECT 
        COUNT(*) as total_records,
        SUM(amount) as total_amount,
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as completed_amount
        FROM billing_history");
    $totals = $stmt->fetch();
    
    echo "Total Records: {$totals['total_records']}\n";
    echo "Total Amount: \${$totals['total_amount']}\n";
    echo "Completed Amount: \${$totals['completed_amount']}\n";
    
    echo "\n=== Monthly Revenue Query Test ===\n";
    $stmt = $pdo->query("
        SELECT 
            DATE_FORMAT(created_at, '%Y-%m') as month,
            SUM(amount) as revenue,
            COUNT(*) as count
        FROM billing_history 
        WHERE status = 'completed' 
            AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month DESC
    ");
    $monthlyData = $stmt->fetchAll();
    
    if (empty($monthlyData)) {
        echo "NO MONTHLY REVENUE DATA FOUND!\n";
        
        // Check what dates we have
        echo "\n=== Available Dates ===\n";
        $stmt = $pdo->query("SELECT DISTINCT DATE_FORMAT(created_at, '%Y-%m') as month FROM billing_history ORDER BY month DESC");
        while ($row = $stmt->fetch()) {
            echo "Month: {$row['month']}\n";
        }
    } else {
        foreach ($monthlyData as $month) {
            echo "Month: {$month['month']}, Revenue: \${$month['revenue']}, Count: {$month['count']}\n";
        }
    }
    
    echo "</pre>\n";
    
} catch (Exception $e) {
    echo "<h2>Error</h2>\n";
    echo "<pre>Error: " . $e->getMessage() . "</pre>\n";
}
?>
