<?php
// Direct test of statistics API
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Start session to simulate admin login
session_start();

require_once 'backend/config.php';

echo "<h2>Admin Statistics API Test</h2>";

try {
    // First, let's manually set admin session for testing
    $pdo = getDBConnection();
    $stmt = $pdo->prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
    $stmt->execute();
    $admin = $stmt->fetch();
    
    if ($admin) {
        $_SESSION['user_id'] = $admin['id'];
        echo "✅ Admin session set (User ID: " . $admin['id'] . ")<br><br>";
        
        // Now test the statistics API
        echo "<h3>Testing Statistics API:</h3>";
        
        try {
            // Include the statistics API file
            ob_start();
            include 'backend/api/admin/get-statistics.php';
            $output = ob_get_clean();
            
            echo "✅ Statistics API executed successfully<br>";
            echo "<strong>API Response:</strong><br>";
            echo "<pre>" . htmlspecialchars($output) . "</pre>";
            
        } catch (Exception $e) {
            echo "❌ Statistics API error: " . $e->getMessage() . "<br>";
        }
        
    } else {
        echo "❌ No admin user found in database<br>";
    }
    
} catch (Exception $e) {
    echo "❌ Database error: " . $e->getMessage() . "<br>";
}
?>
