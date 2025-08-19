<?php
require_once 'backend/config.php';

try {
    $pdo = getDBConnection();
    
    echo "<h2>Fixing Revenue Data...</h2>\n";
    echo "<pre>\n";
    
    // Clear existing billing history
    echo "Clearing existing billing history...\n";
    $pdo->exec("DELETE FROM billing_history");
    
    // Insert new billing data with recent dates
    echo "Inserting new billing data...\n";
    
    $billingData = [
        // Alice's payments (Professional - $79.99) - Recent payments
        [5, 1, 79.99, 'credit_card', 'completed', 'txn_alice_001', '2025-02-15 10:30:00'],
        [5, 1, 79.99, 'credit_card', 'completed', 'txn_alice_002', '2025-01-15 10:30:00'],
        [5, 1, 79.99, 'credit_card', 'completed', 'txn_alice_003', '2024-12-15 10:30:00'],
        [5, 1, 79.99, 'credit_card', 'completed', 'txn_alice_004', '2024-11-15 10:30:00'],

        // Bob's payments (Starter - $29.99) - Recent payments
        [6, 2, 29.99, 'credit_card', 'completed', 'txn_bob_001', '2025-02-01 14:20:00'],
        [6, 2, 29.99, 'credit_card', 'completed', 'txn_bob_002', '2025-01-01 14:20:00'],
        [6, 2, 29.99, 'credit_card', 'completed', 'txn_bob_003', '2024-12-01 14:20:00'],

        // Carol's payments (Enterprise - $199.99) - Recent payments
        [7, 3, 199.99, 'credit_card', 'completed', 'txn_carol_001', '2025-02-10 09:15:00'],
        [7, 3, 199.99, 'credit_card', 'completed', 'txn_carol_002', '2025-01-10 09:15:00'],
        [7, 3, 199.99, 'credit_card', 'completed', 'txn_carol_003', '2024-12-10 09:15:00'],

        // David's payments (Professional - $79.99) - Recent payments
        [8, 4, 79.99, 'credit_card', 'completed', 'txn_david_001', '2025-02-20 16:45:00'],
        [8, 4, 79.99, 'credit_card', 'completed', 'txn_david_002', '2025-01-20 16:45:00'],

        // Emma's payments (Starter - $29.99) - Recent payments
        [9, 5, 29.99, 'paypal', 'completed', 'txn_emma_001', '2025-02-05 11:30:00'],
        [9, 5, 29.99, 'paypal', 'completed', 'txn_emma_002', '2025-01-05 11:30:00'],

        // Frank's payments (Professional - $79.99) - Recent payments
        [10, 6, 79.99, 'credit_card', 'completed', 'txn_frank_001', '2025-02-15 13:20:00'],
        [10, 6, 79.99, 'credit_card', 'completed', 'txn_frank_002', '2025-01-15 13:20:00'],

        // Grace's payments (Starter - $29.99) - Recent payments
        [11, 7, 29.99, 'stripe', 'completed', 'txn_grace_001', '2025-02-20 08:45:00'],
        [11, 7, 29.99, 'stripe', 'completed', 'txn_grace_002', '2025-01-20 08:45:00'],

        // Additional historical payments for better charts
        [5, 1, 79.99, 'credit_card', 'completed', 'txn_alice_005', '2024-10-15 10:30:00'],
        [6, 2, 29.99, 'credit_card', 'completed', 'txn_bob_004', '2024-11-01 14:20:00'],
        [7, 3, 199.99, 'credit_card', 'completed', 'txn_carol_004', '2024-11-10 09:15:00'],
    ];
    
    $stmt = $pdo->prepare("INSERT INTO billing_history (user_id, subscription_id, amount, payment_method, status, transaction_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)");
    
    $successCount = 0;
    foreach ($billingData as $record) {
        try {
            $stmt->execute($record);
            $successCount++;
            echo "✓ Inserted payment: \${$record[2]} on {$record[6]}\n";
        } catch (Exception $e) {
            echo "✗ Failed to insert payment: " . $e->getMessage() . "\n";
        }
    }
    
    echo "\nInserted $successCount billing records successfully!\n";
    
    // Verify the data
    echo "\n=== Revenue Verification ===\n";
    $stmt = $pdo->query("SELECT 
        COUNT(*) as total_records,
        SUM(amount) as total_amount,
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as completed_amount
        FROM billing_history");
    $totals = $stmt->fetch();
    
    echo "Total Records: {$totals['total_records']}\n";
    echo "Total Amount: \${$totals['total_amount']}\n";
    echo "Completed Amount: \${$totals['completed_amount']}\n";
    
    echo "\n=== Monthly Revenue ===\n";
    $stmt = $pdo->query("
        SELECT 
            DATE_FORMAT(created_at, '%Y-%m') as month,
            SUM(amount) as revenue,
            COUNT(*) as count
        FROM billing_history 
        WHERE status = 'completed' 
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month DESC
    ");
    
    while ($row = $stmt->fetch()) {
        echo "Month: {$row['month']}, Revenue: \${$row['revenue']}, Payments: {$row['count']}\n";
    }
    
    echo "\n✅ Revenue data fixed successfully!\n";
    echo "Total Revenue should now be: \${$totals['completed_amount']}\n";
    echo "</pre>\n";
    
    echo "<br><a href='admin_login_test.php' style='background: #00d4ff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px;'>Login as Admin</a>";
    echo " <a href='admin-dashboard.html' style='background: #7c3aed; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; margin-left: 10px;'>Go to Dashboard</a>";
    
} catch (Exception $e) {
    echo "<h2>Error</h2>\n";
    echo "<pre>Error: " . $e->getMessage() . "</pre>\n";
}
?>
