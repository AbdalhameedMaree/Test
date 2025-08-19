<?php
// Add sample data for better chart visualization
require_once 'backend/config.php';

echo "<h2>Adding Sample Data for Charts</h2>";

try {
    $pdo = getDBConnection();
    
    // Add some subscriptions for chart data
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM subscriptions");
    $stmt->execute();
    $subCount = $stmt->fetchColumn();
    
    if ($subCount == 0) {
        // Get plan IDs
        $stmt = $pdo->query("SELECT id FROM plans ORDER BY id LIMIT 3");
        $planIds = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        // Get user IDs (we'll create some sample users if needed)
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE role = 'customer'");
        $stmt->execute();
        $customerCount = $stmt->fetchColumn();
        
        if ($customerCount == 0) {
            // Create sample customers
            $customers = [
                ['John', 'Doe', 'john@example.com', 'customer'],
                ['Jane', 'Smith', 'jane@example.com', 'customer'],
                ['Bob', 'Johnson', 'bob@example.com', 'customer'],
                ['Alice', 'Wilson', 'alice@example.com', 'customer'],
                ['Mike', 'Brown', 'mike@example.com', 'customer']
            ];
            
            $stmt = $pdo->prepare("
                INSERT INTO users (first_name, last_name, email, password_hash, role, is_verified) 
                VALUES (?, ?, ?, ?, ?, ?)
            ");
            
            foreach ($customers as $customer) {
                $stmt->execute([
                    $customer[0], 
                    $customer[1], 
                    $customer[2], 
                    password_hash('password123', PASSWORD_DEFAULT), 
                    $customer[3], 
                    1
                ]);
            }
            echo "✅ Created 5 sample customers<br>";
        }
        
        // Get customer IDs
        $stmt = $pdo->query("SELECT id FROM users WHERE role = 'customer' LIMIT 10");
        $userIds = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        // Create subscriptions
        if (!empty($planIds) && !empty($userIds)) {
            $subscriptions = [];
            foreach ($userIds as $index => $userId) {
                $planId = $planIds[$index % count($planIds)];
                $subscriptions[] = [$userId, $planId, 'active'];
            }
            
            $stmt = $pdo->prepare("
                INSERT INTO subscriptions (user_id, plan_id, status, start_date) 
                VALUES (?, ?, ?, NOW() - INTERVAL FLOOR(RAND() * 365) DAY)
            ");
            
            foreach ($subscriptions as $sub) {
                $stmt->execute($sub);
            }
            echo "✅ Created " . count($subscriptions) . " sample subscriptions<br>";
        }
    }
    
    // Add billing history for revenue chart
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM billing_history");
    $stmt->execute();
    $billCount = $stmt->fetchColumn();
    
    if ($billCount == 0) {
        // Get subscription IDs
        $stmt = $pdo->query("SELECT id FROM subscriptions");
        $subIds = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        if (!empty($subIds)) {
            $stmt = $pdo->prepare("
                INSERT INTO billing_history (subscription_id, amount, status, billing_date) 
                VALUES (?, ?, 'completed', ?)
            ");
            
            // Generate billing history for last 6 months
            for ($month = 0; $month < 6; $month++) {
                $date = date('Y-m-01', strtotime("-$month months"));
                
                foreach ($subIds as $subId) {
                    // Random chance of payment in each month
                    if (rand(1, 100) <= 80) { // 80% chance of payment
                        $amount = rand(999, 9999) / 100; // Random amount between $9.99 and $99.99
                        $billingDate = date('Y-m-d', strtotime($date . ' +' . rand(1, 28) . ' days'));
                        $stmt->execute([$subId, $amount, $billingDate]);
                    }
                }
            }
            echo "✅ Created billing history for 6 months<br>";
        }
    }
    
    echo "<br><h3>Data Summary:</h3>";
    
    $tables = [
        'users' => 'Users',
        'plans' => 'Plans', 
        'subscriptions' => 'Subscriptions',
        'reviews' => 'Reviews',
        'contact_messages' => 'Messages',
        'billing_history' => 'Billing Records'
    ];
    
    foreach ($tables as $table => $label) {
        $stmt = $pdo->query("SELECT COUNT(*) FROM $table");
        $count = $stmt->fetchColumn();
        echo "✅ $label: $count records<br>";
    }
    
    echo "<br><strong>✅ Sample data created! Charts should now show meaningful data.</strong><br>";
    echo "<a href='admin-login.html' style='display: inline-block; margin-top: 10px; padding: 10px 20px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px;'>Test Admin Dashboard</a>";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage();
}
?>
