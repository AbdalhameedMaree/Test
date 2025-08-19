<?php
// Quick admin login helper for testing
require_once 'backend/config.php';

session_start();

// Log in as admin user for testing
try {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? AND role = 'admin' LIMIT 1");
    $stmt->execute(['admin@agenteq.com']);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_role'] = $user['role'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['user_name'] = $user['first_name'] . ' ' . $user['last_name'];
        
        echo "<h2>✅ Admin Login Successful!</h2>";
        echo "<p>Logged in as: " . htmlspecialchars($user['first_name'] . ' ' . $user['last_name']) . "</p>";
        echo "<p>Email: " . htmlspecialchars($user['email']) . "</p>";
        echo "<p>Role: " . htmlspecialchars($user['role']) . "</p>";
        echo "<br>";
        echo "<a href='admin-dashboard.html' style='background: #00d4ff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px;'>Go to Admin Dashboard</a>";
        echo "<br><br>";
        echo "<a href='index.html'>Back to Main Page</a>";
    } else {
        echo "<h2>❌ No admin user found!</h2>";
        echo "<p>Please make sure you've run the database population script.</p>";
        echo "<a href='populate_db.php'>Populate Database</a>";
    }
    
} catch (Exception $e) {
    echo "<h2>Error</h2>";
    echo "<p>Error: " . htmlspecialchars($e->getMessage()) . "</p>";
}
?>
