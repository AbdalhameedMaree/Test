<?php
// Simple test script to debug registration issues
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "=== Registration Debug Test ===\n";

// Test 1: Check if config.php loads
echo "1. Testing config.php...\n";
try {
    require_once __DIR__ . '/../../config.php';
    echo "✅ Config loaded successfully\n";
} catch (Exception $e) {
    echo "❌ Config error: " . $e->getMessage() . "\n";
    exit;
}

// Test 2: Check database connection
echo "2. Testing database connection...\n";
try {
    $pdo = getDBConnection();
    echo "✅ Database connected successfully\n";
} catch (Exception $e) {
    echo "❌ Database error: " . $e->getMessage() . "\n";
    exit;
}

// Test 3: Check if users table exists and structure
echo "3. Testing users table structure...\n";
try {
    $stmt = $pdo->query("DESCRIBE users");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "✅ Users table found with columns:\n";
    foreach ($columns as $col) {
        echo "   - " . $col['Field'] . " (" . $col['Type'] . ")\n";
    }
} catch (Exception $e) {
    echo "❌ Users table error: " . $e->getMessage() . "\n";
    exit;
}

// Test 4: Check if mailer utilities load
echo "4. Testing mailer utilities...\n";
try {
    require_once __DIR__ . '/../../utils/mailer.php';
    echo "✅ Mailer utilities loaded\n";
    
    // Test token generation
    $token = generateRandomToken();
    echo "✅ Token generated: " . substr($token, 0, 8) . "...\n";
} catch (Exception $e) {
    echo "❌ Mailer error: " . $e->getMessage() . "\n";
    exit;
}

// Test 5: Check PHPMailer
echo "5. Testing PHPMailer...\n";
try {
    $autoloadPath = __DIR__ . '/../../vendor/autoload.php';
    if (file_exists($autoloadPath)) {
        require_once $autoloadPath;
        echo "✅ Composer autoload found\n";
        
        if (class_exists('PHPMailer\PHPMailer\PHPMailer')) {
            echo "✅ PHPMailer class available\n";
        } else {
            echo "❌ PHPMailer class not found\n";
        }
    } else {
        echo "❌ Composer autoload not found at: $autoloadPath\n";
    }
} catch (Exception $e) {
    echo "❌ PHPMailer test error: " . $e->getMessage() . "\n";
}

echo "\n=== Debug Test Complete ===\n";
?>
