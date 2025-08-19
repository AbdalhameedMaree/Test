<?php
require_once 'backend/config.php';

try {
    $pdo = getDBConnection();
    
    echo "<h2>Adding Billing Data for Your Existing Subscriptions</h2>\n";
    echo "<pre>\n";
    
    // Get your actual active subscriptions
    $stmt = $pdo->query("
        SELECT s.id, s.user_id, s.plan_id, s.status, p.name as plan_name, p.price, u.first_name, u.last_name 
        FROM subscriptions s 
        LEFT JOIN plans p ON s.plan_id = p.id 
        LEFT JOIN users u ON s.user_id = u.id 
        WHERE s.status = 'active'
        ORDER BY s.id
    ");
    $subscriptions = $stmt->fetchAll();
    
    if (count($subscriptions) > 0) {
        echo "Found " . count($subscriptions) . " active subscriptions.\n";
        echo "Adding billing records for each subscription...\n\n";
        
        $successCount = 0;
        $stmt = $pdo->prepare("
            INSERT INTO billing_history (user_id, subscription_id, amount, payment_method, status, transaction_id, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        
        foreach ($subscriptions as $sub) {
            $userId = $sub['user_id'];
            $subscriptionId = $sub['id'];
            $amount = $sub['price'];
            $customerName = $sub['first_name'] . ' ' . $sub['last_name'];
            $planName = $sub['plan_name'];
            
            echo "Adding billing records for {$customerName} ({$planName} - \${$amount}):\n";
            
            // Add 3 months of billing history for each subscription
            $billingDates = [
                '2025-02-15 10:30:00',
                '2025-01-15 10:30:00', 
                '2024-12-15 10:30:00'
            ];
            
            foreach ($billingDates as $index => $date) {
                $transactionId = "txn_{$userId}_{$subscriptionId}_" . str_pad($index + 1, 3, '0', STR_PAD_LEFT);
                
                try {
                    $stmt->execute([
                        $userId,
                        $subscriptionId,
                        $amount,
                        'credit_card',
                        'completed',
                        $transactionId,
                        $date
                    ]);
                    
                    echo "  ✓ Added: \${$amount} on {$date} (Transaction: {$transactionId})\n";
                    $successCount++;
                    
                } catch (Exception $e) {
                    echo "  ✗ Failed to add billing record: " . $e->getMessage() . "\n";
                }
            }
            echo "\n";
        }
        
        echo "Successfully added {$successCount} billing records!\n\n";
        
        // Verify the results
        echo "=== VERIFICATION ===\n";
        
        $stmt = $pdo->query("SELECT COUNT(*) as count, SUM(amount) as total FROM billing_history WHERE status = 'completed'");
        $result = $stmt->fetch();
        
        echo "Total billing records: {$result['count']}\n";
        echo "Total revenue: \${$result['total']}\n\n";
        
        // Monthly breakdown
        echo "=== MONTHLY REVENUE BREAKDOWN ===\n";
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
        
        echo "\n✅ DASHBOARD IS NOW READY!\n";
        echo "Your charts will now show:\n";
        echo "- Total Revenue: \${$result['total']}\n";
        echo "- Monthly Revenue Trends\n";
        echo "- Subscription Distribution\n";
        echo "- Plan Performance Metrics\n";
        
    } else {
        echo "❌ No active subscriptions found in your database.\n";
        echo "Please add some subscriptions first, then run this script again.\n";
    }
    
    echo "</pre>\n";
    
    echo "<br><a href='final_dashboard_test.php' style='background: #f59e0b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px;'>Test Dashboard</a>";
    echo " <a href='admin_login_test.php' style='background: #00d4ff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; margin-left: 10px;'>Login as Admin</a>";
    echo " <a href='admin-dashboard.html' style='background: #7c3aed; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; margin-left: 10px;'>View Dashboard</a>";
    
} catch (Exception $e) {
    echo "<h2>Error</h2>\n";
    echo "<pre>Error: " . $e->getMessage() . "</pre>\n";
}
?>
