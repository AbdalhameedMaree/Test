<?php
require_once 'backend/config.php';

try {
    $pdo = getDBConnection();
    
    echo "<h2>Current Database Structure Analysis</h2>\n";
    echo "<pre>\n";
    
    // Check existing subscriptions
    echo "=== EXISTING SUBSCRIPTIONS ===\n";
    $stmt = $pdo->query("SELECT s.id, s.user_id, s.plan_id, s.status, p.name as plan_name, p.price, u.first_name, u.last_name FROM subscriptions s LEFT JOIN plans p ON s.plan_id = p.id LEFT JOIN users u ON s.user_id = u.id ORDER BY s.id");
    $subscriptions = $stmt->fetchAll();
    
    if (count($subscriptions) > 0) {
        foreach ($subscriptions as $sub) {
            echo "Subscription ID: {$sub['id']} | User: {$sub['first_name']} {$sub['last_name']} (ID: {$sub['user_id']}) | Plan: {$sub['plan_name']} (ID: {$sub['plan_id']}) | Price: \${$sub['price']} | Status: {$sub['status']}\n";
        }
    } else {
        echo "No subscriptions found!\n";
    }
    
    // Check existing users
    echo "\n=== EXISTING USERS ===\n";
    $stmt = $pdo->query("SELECT id, first_name, last_name, email, role FROM users ORDER BY id");
    $users = $stmt->fetchAll();
    
    if (count($users) > 0) {
        foreach ($users as $user) {
            echo "User ID: {$user['id']} | Name: {$user['first_name']} {$user['last_name']} | Email: {$user['email']} | Role: {$user['role']}\n";
        }
    } else {
        echo "No users found!\n";
    }
    
    // Check existing plans
    echo "\n=== EXISTING PLANS ===\n";
    $stmt = $pdo->query("SELECT id, name, price, billing_period FROM plans ORDER BY id");
    $plans = $stmt->fetchAll();
    
    if (count($plans) > 0) {
        foreach ($plans as $plan) {
            echo "Plan ID: {$plan['id']} | Name: {$plan['name']} | Price: \${$plan['price']} | Period: {$plan['billing_period']}\n";
        }
    } else {
        echo "No plans found!\n";
    }
    
    // Check existing billing history
    echo "\n=== EXISTING BILLING HISTORY ===\n";
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM billing_history");
    $billingCount = $stmt->fetch();
    echo "Total billing records: {$billingCount['count']}\n";
    
    if ($billingCount['count'] > 0) {
        $stmt = $pdo->query("SELECT * FROM billing_history LIMIT 5");
        $billingRecords = $stmt->fetchAll();
        foreach ($billingRecords as $record) {
            echo "Billing ID: {$record['id']} | User: {$record['user_id']} | Subscription: {$record['subscription_id']} | Amount: \${$record['amount']} | Status: {$record['status']}\n";
        }
    }
    
    // Generate correct SQL for your database
    echo "\n=== CORRECT SQL FOR YOUR DATABASE ===\n";
    
    if (count($subscriptions) > 0) {
        echo "-- Run this SQL in your MySQL to add billing data:\n\n";
        echo "USE AgentEQ_db;\n\n";
        
        foreach ($subscriptions as $sub) {
            if ($sub['status'] == 'active') {
                $price = $sub['price'];
                $userId = $sub['user_id'];
                $subscriptionId = $sub['id'];
                
                echo "-- Billing records for {$sub['first_name']} {$sub['last_name']} ({$sub['plan_name']} - \${$price})\n";
                echo "INSERT INTO billing_history (user_id, subscription_id, amount, payment_method, status, transaction_id, created_at) VALUES\n";
                echo "({$userId}, {$subscriptionId}, {$price}, 'credit_card', 'completed', 'txn_{$userId}_{$subscriptionId}_001', '2025-02-15 10:30:00'),\n";
                echo "({$userId}, {$subscriptionId}, {$price}, 'credit_card', 'completed', 'txn_{$userId}_{$subscriptionId}_002', '2025-01-15 10:30:00'),\n";
                echo "({$userId}, {$subscriptionId}, {$price}, 'credit_card', 'completed', 'txn_{$userId}_{$subscriptionId}_003', '2024-12-15 10:30:00');\n\n";
            }
        }
    } else {
        echo "No active subscriptions found. You need to add some subscriptions first.\n";
    }
    
    echo "</pre>\n";
    
    echo "<br><a href='final_dashboard_test.php' style='background: #00d4ff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px;'>Test Dashboard</a>";
    echo " <a href='admin-dashboard.html' style='background: #7c3aed; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; margin-left: 10px;'>View Dashboard</a>";
    
} catch (Exception $e) {
    echo "<h2>Error</h2>\n";
    echo "<pre>Error: " . $e->getMessage() . "</pre>\n";
}
?>
