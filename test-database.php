<?php
// Simple test script to check admin login and database connection
require_once 'backend/config.php';

echo "<h2>Database Connection Test</h2>";

try {
    $pdo = getDBConnection();
    echo "✅ Database connection successful<br>";
    
    // Check if admin user exists
    $stmt = $pdo->prepare("SELECT id, first_name, last_name, email, role, password_hash FROM users WHERE role = 'admin'");
    $stmt->execute();
    $admin = $stmt->fetch();
    
    if ($admin) {
        echo "✅ Admin user found:<br>";
        echo "ID: " . $admin['id'] . "<br>";
        echo "Name: " . $admin['first_name'] . " " . $admin['last_name'] . "<br>";
        echo "Email: " . $admin['email'] . "<br>";
        echo "Role: " . $admin['role'] . "<br>";
        echo "Password Hash: " . substr($admin['password_hash'], 0, 20) . "...<br><br>";
        
        // Test password verification
        $testPasswords = ['admin123', 'password', 'admin', '1234'];
        echo "<h3>Password Test:</h3>";
        foreach ($testPasswords as $pass) {
            $verified = password_verify($pass, $admin['password_hash']);
            echo "Password '$pass': " . ($verified ? "✅ CORRECT" : "❌ Wrong") . "<br>";
        }
    } else {
        echo "❌ No admin user found<br>";
    }
    
    // Test table existence
    echo "<h3>Database Tables:</h3>";
    $tables = ['users', 'plans', 'subscriptions', 'reviews', 'contact_messages', 'billing_history'];
    foreach ($tables as $table) {
        try {
            $stmt = $pdo->query("SELECT COUNT(*) FROM $table");
            $count = $stmt->fetchColumn();
            echo "✅ Table '$table': $count records<br>";
        } catch (Exception $e) {
            echo "❌ Table '$table': Error - " . $e->getMessage() . "<br>";
        }
    }
    
} catch (Exception $e) {
    echo "❌ Database error: " . $e->getMessage();
}

echo "<h3>Session Info:</h3>";
echo "Session ID: " . session_id() . "<br>";
echo "Session Status: " . session_status() . "<br>";
echo "Logged In: " . (isLoggedIn() ? "Yes" : "No") . "<br>";
if (isLoggedIn()) {
    $user = getCurrentUser();
    echo "Current User: " . ($user ? json_encode($user) : "Error getting user") . "<br>";
}
?>
