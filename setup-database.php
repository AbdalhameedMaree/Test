<?php
// Database setup and verification script
require_once 'backend/config.php';

echo "<h2>AgentEQ Database Setup & Verification</h2>";

try {
    $pdo = getDBConnection();
    echo "✅ Database connection successful<br><br>";
    
    // Check and create missing tables
    echo "<h3>Table Structure Verification:</h3>";
    
    // Create users table if it doesn't exist
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            first_name VARCHAR(100) NOT NULL,
            last_name VARCHAR(100) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role ENUM('admin', 'employee', 'customer') DEFAULT 'customer',
            is_verified BOOLEAN DEFAULT FALSE,
            verification_token VARCHAR(255),
            verification_token_expires_at TIMESTAMP NULL,
            last_verification_sent_at TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    
    // Create plans table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS plans (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            price DECIMAL(10,2) NOT NULL,
            billing_period ENUM('monthly', 'yearly') DEFAULT 'monthly',
            monthly_conversations INT DEFAULT 0,
            features JSON,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    
    // Create subscriptions table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS subscriptions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            plan_id INT NOT NULL,
            status ENUM('active', 'cancelled', 'expired') DEFAULT 'active',
            start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            end_date TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    
    // Create reviews table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS reviews (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255),
            email VARCHAR(255),
            company VARCHAR(255),
            rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
            title VARCHAR(255),
            content TEXT NOT NULL,
            is_approved BOOLEAN DEFAULT FALSE,
            is_featured BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    
    // Create contact_messages table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS contact_messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            company VARCHAR(255),
            message TEXT NOT NULL,
            is_read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    
    // Create billing_history table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS billing_history (
            id INT AUTO_INCREMENT PRIMARY KEY,
            subscription_id INT,
            amount DECIMAL(10,2) NOT NULL,
            status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
            billing_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    
    echo "✅ All tables created/verified<br><br>";
    
    // Insert admin user if doesn't exist
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE role = 'admin'");
    $stmt->execute();
    $adminCount = $stmt->fetchColumn();
    
    if ($adminCount == 0) {
        $adminPassword = password_hash('admin123', PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("
            INSERT INTO users (first_name, last_name, email, password_hash, role, is_verified) 
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute(['Admin', 'User', 'admin@agentiq.com', $adminPassword, 'admin', 1]);
        echo "✅ Admin user created (admin@agentiq.com / admin123)<br>";
    } else {
        echo "✅ Admin user already exists<br>";
    }
    
    // Insert sample data if tables are empty
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM plans");
    $stmt->execute();
    $planCount = $stmt->fetchColumn();
    
    if ($planCount == 0) {
        $plans = [
            ['Starter', 'Perfect for individuals', 9.99, 'monthly', 100],
            ['Professional', 'Great for small teams', 29.99, 'monthly', 500],
            ['Enterprise', 'For large organizations', 99.99, 'monthly', 2000]
        ];
        
        $stmt = $pdo->prepare("
            INSERT INTO plans (name, description, price, billing_period, monthly_conversations) 
            VALUES (?, ?, ?, ?, ?)
        ");
        
        foreach ($plans as $plan) {
            $stmt->execute($plan);
        }
        echo "✅ Sample plans created<br>";
    }
    
    // Insert sample reviews if empty
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM reviews");
    $stmt->execute();
    $reviewCount = $stmt->fetchColumn();
    
    if ($reviewCount == 0) {
        $reviews = [
            ['John Doe', 'john@example.com', 'Tech Corp', 5, 'Excellent Service', 'AgentEQ has transformed our customer service!', 1, 1],
            ['Jane Smith', 'jane@example.com', 'StartUp Inc', 4, 'Great Tool', 'Very helpful for our business needs.', 1, 0],
            ['Bob Johnson', 'bob@example.com', 'Enterprise Ltd', 5, 'Outstanding', 'Best AI agent platform we have used.', 1, 1]
        ];
        
        $stmt = $pdo->prepare("
            INSERT INTO reviews (name, email, company, rating, title, content, is_approved, is_featured) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        foreach ($reviews as $review) {
            $stmt->execute($review);
        }
        echo "✅ Sample reviews created<br>";
    }
    
    // Insert sample contact messages if empty
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM contact_messages");
    $stmt->execute();
    $messageCount = $stmt->fetchColumn();
    
    if ($messageCount == 0) {
        $messages = [
            ['Alice Cooper', 'alice@example.com', 'Music Corp', 'Interested in your enterprise plan.'],
            ['David Wilson', 'david@example.com', 'Tech Solutions', 'Need more information about pricing.'],
            ['Sarah Brown', 'sarah@example.com', null, 'How can I integrate this with my existing system?']
        ];
        
        $stmt = $pdo->prepare("
            INSERT INTO contact_messages (name, email, company, message) 
            VALUES (?, ?, ?, ?)
        ");
        
        foreach ($messages as $message) {
            $stmt->execute($message);
        }
        echo "✅ Sample contact messages created<br>";
    }
    
    echo "<br><h3>Final Database Status:</h3>";
    
    $tables = ['users', 'plans', 'subscriptions', 'reviews', 'contact_messages', 'billing_history'];
    foreach ($tables as $table) {
        $stmt = $pdo->query("SELECT COUNT(*) FROM $table");
        $count = $stmt->fetchColumn();
        echo "✅ Table '$table': $count records<br>";
    }
    
    echo "<br><strong>✅ Database setup complete! You can now use the admin dashboard.</strong><br>";
    echo "<a href='admin-login.html' style='display: inline-block; margin-top: 10px; padding: 10px 20px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px;'>Go to Admin Login</a>";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage();
}
?>
