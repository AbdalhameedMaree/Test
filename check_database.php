<?php
require_once 'backend/config.php';

try {
    $pdo = getDBConnection();
    
    echo "<h2>Your Existing Database Structure</h2>\n";
    echo "<pre>\n";
    
    // Check billing_history table structure
    echo "=== Billing History Table Columns ===\n";
    $stmt = $pdo->query("DESCRIBE billing_history");
    $columns = $stmt->fetchAll();
    foreach ($columns as $col) {
        echo "Column: {$col['Field']} | Type: {$col['Type']} | Null: {$col['Null']} | Default: {$col['Default']}\n";
    }
    
    echo "\n=== Sample Billing Records ===\n";
    $stmt = $pdo->query("SELECT * FROM billing_history LIMIT 5");
    $records = $stmt->fetchAll();
    
    if (empty($records)) {
        echo "No billing records found in your database.\n";
    } else {
        foreach ($records as $record) {
            echo "ID: {$record['id']}, Amount: \${$record['amount']}, Status: {$record['status']}\n";
            // Show available date columns
            foreach ($record as $key => $value) {
                if (strpos($key, 'date') !== false || strpos($key, 'created') !== false || strpos($key, 'updated') !== false) {
                    echo "  Date field: $key = $value\n";
                }
            }
            echo "\n";
        }
    }
    
    echo "\n=== Your Total Revenue ===\n";
    $stmt = $pdo->query("SELECT 
        COUNT(*) as total_records,
        SUM(amount) as total_amount,
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as completed_amount
        FROM billing_history");
    $totals = $stmt->fetch();
    
    echo "Total Records: {$totals['total_records']}\n";
    echo "Total Amount: \${$totals['total_amount']}\n";
    echo "Completed Amount: \${$totals['completed_amount']}\n";
    
    echo "\n=== Available Date Columns Test ===\n";
    $dateColumns = [];
    foreach ($columns as $col) {
        $colName = $col['Field'];
        if (strpos($colName, 'date') !== false || strpos($colName, 'created') !== false || strpos($colName, 'time') !== false) {
            $dateColumns[] = $colName;
            echo "Found date column: $colName\n";
        }
    }
    
    // Test monthly revenue with each date column
    echo "\n=== Testing Monthly Revenue Queries ===\n";
    foreach ($dateColumns as $dateCol) {
        try {
            echo "Testing with column: $dateCol\n";
            $stmt = $pdo->query("
                SELECT 
                    DATE_FORMAT($dateCol, '%Y-%m') as month,
                    SUM(amount) as revenue,
                    COUNT(*) as count
                FROM billing_history 
                WHERE status = 'completed' 
                GROUP BY DATE_FORMAT($dateCol, '%Y-%m')
                ORDER BY month DESC
                LIMIT 5
            ");
            $monthlyData = $stmt->fetchAll();
            
            if ($monthlyData) {
                foreach ($monthlyData as $month) {
                    echo "  Month: {$month['month']}, Revenue: \${$month['revenue']}, Count: {$month['count']}\n";
                }
            } else {
                echo "  No data returned\n";
            }
        } catch (Exception $e) {
            echo "  Error with $dateCol: " . $e->getMessage() . "\n";
        }
        echo "\n";
    }
    
    echo "</pre>\n";
    
} catch (Exception $e) {
    echo "<h2>Error</h2>\n";
    echo "<pre>Error: " . $e->getMessage() . "</pre>\n";
}
?>
