<?php
require_once 'backend/config.php';

try {
    $pdo = getDBConnection();
    
    echo "<h2>Adding Sample Billing Data to Your Database</h2>\n";
    echo "<pre>\n";
    
    // First, let's get your existing subscriptions
    $stmt = $pdo->query("SELECT * FROM subscriptions WHERE status = 'active' ORDER BY id");
    $subscriptions = $stmt->fetchAll();
    
    echo "Found " . count($subscriptions) . " active subscriptions\n";
    
    if (count($subscriptions) > 0) {
        echo "Adding billing records for existing subscriptions...\n\n";
        
        // Get plan prices for revenue calculation
        $stmt = $pdo->query("SELECT id, price FROM plans");
        $planPrices = [];
        while ($row = $stmt->fetch()) {
            $planPrices[$row['id']] = $row['price'];
        }
        
        $billingRecords = [];
        
        foreach ($subscriptions as $subscription) {
            $planPrice = $planPrices[$subscription['plan_id']] ?? 29.99;
            $userId = $subscription['user_id'];
            $subscriptionId = $subscription['id'];
            
            // Add 3 months of billing history for each subscription
            $dates = [
                '2025-02-15 10:30:00',
                '2025-01-15 10:30:00', 
                '2024-12-15 10:30:00'
            ];
            
            foreach ($dates as $index => $date) {
                $billingRecords[] = [
                    'user_id' => $userId,
                    'subscription_id' => $subscriptionId,
                    'amount' => $planPrice,
                    'currency' => 'USD',
                    'payment_method' => 'credit_card',
                    'transaction_id' => 'txn_' . $subscriptionId . '_' . ($index + 1),
                    'status' => 'completed',
                    'billing_date' => $date,
                    'created_at' => $date
                ];
            }
        }
        
        // Insert billing records
        $stmt = $pdo->prepare("
            INSERT INTO billing_history 
            (user_id, subscription_id, amount, currency, payment_method, transaction_id, status, billing_date, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $successCount = 0;
        foreach ($billingRecords as $record) {
            try {
                $stmt->execute([
                    $record['user_id'],
                    $record['subscription_id'], 
                    $record['amount'],
                    $record['currency'],
                    $record['payment_method'],
                    $record['transaction_id'],
                    $record['status'],
                    $record['billing_date'],
                    $record['created_at']
                ]);
                $successCount++;
                echo "✓ Added billing record: \${$record['amount']} for subscription {$record['subscription_id']}\n";
            } catch (Exception $e) {
                echo "✗ Failed to add billing record: " . $e->getMessage() . "\n";
            }
        }
        
        echo "\nSuccessfully added $successCount billing records!\n";
        
        // Verify the data
        echo "\n=== VERIFICATION ===\n";
        $stmt = $pdo->query("SELECT COUNT(*) as count, SUM(amount) as total FROM billing_history WHERE status = 'completed'");
        $result = $stmt->fetch();
        
        echo "Total billing records: {$result['count']}\n";
        echo "Total revenue: \${$result['total']}\n";
        
        echo "\n=== MONTHLY BREAKDOWN ===\n";
        $stmt = $pdo->query("
            SELECT 
                DATE_FORMAT(created_at, '%Y-%m') as month,
                SUM(amount) as revenue,
                COUNT(*) as payments
            FROM billing_history 
            WHERE status = 'completed'
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
            ORDER BY month DESC
        ");
        
        while ($row = $stmt->fetch()) {
            echo "Month {$row['month']}: \${$row['revenue']} ({$row['payments']} payments)\n";
        }
        
        echo "\n✅ Your dashboard should now show:\n";
        echo "- Total Revenue: \${$result['total']}\n";
        echo "- Working Monthly Revenue Chart\n";
        echo "- Working Plan Performance Chart\n";
        
    } else {
        echo "❌ No active subscriptions found. Please add some subscriptions first.\n";
    }
    
    echo "</pre>\n";
    
    echo "<br><a href='admin_login_test.php' style='background: #00d4ff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px;'>Login as Admin</a>";
    echo " <a href='admin-dashboard.html' style='background: #7c3aed; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; margin-left: 10px;'>View Dashboard</a>";
    
} catch (Exception $e) {
    echo "<h2>Error</h2>\n";
    echo "<pre>Error: " . $e->getMessage() . "</pre>\n";
}
?>
