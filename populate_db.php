<?php
// Simple script to populate database with sample data
require_once 'backend/config.php';

try {
    // Read the SQL file
    $sql = file_get_contents('populate_database.sql');
    
    if (!$sql) {
        die("Could not read populate_database.sql file");
    }
    
    // Split into individual statements
    $statements = array_filter(array_map('trim', explode(';', $sql)));
    
    $successCount = 0;
    $errorCount = 0;
    
    echo "<h2>Populating Database...</h2>\n";
    echo "<pre>\n";
    
    foreach ($statements as $statement) {
        if (empty($statement) || strpos($statement, '--') === 0) {
            continue; // Skip empty statements and comments
        }
        
        try {
            $stmt = $pdo->prepare($statement);
            $stmt->execute();
            $successCount++;
            echo "✓ Executed statement successfully\n";
        } catch (PDOException $e) {
            $errorCount++;
            echo "✗ Error: " . $e->getMessage() . "\n";
            echo "   Statement: " . substr($statement, 0, 100) . "...\n";
        }
    }
    
    echo "\n=== Summary ===\n";
    echo "Successful statements: $successCount\n";
    echo "Failed statements: $errorCount\n";
    echo "\n";
    
    // Check final counts
    echo "=== Final Database Counts ===\n";
    
    $counts = [
        'Users' => $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn(),
        'Plans' => $pdo->query("SELECT COUNT(*) FROM plans")->fetchColumn(),
        'Subscriptions' => $pdo->query("SELECT COUNT(*) FROM subscriptions")->fetchColumn(),
        'Billing Records' => $pdo->query("SELECT COUNT(*) FROM billing_history")->fetchColumn(),
        'Reviews' => $pdo->query("SELECT COUNT(*) FROM reviews")->fetchColumn(),
        'Contact Messages' => $pdo->query("SELECT COUNT(*) FROM contact_messages")->fetchColumn(),
    ];
    
    foreach ($counts as $table => $count) {
        echo "$table: $count\n";
    }
    
    echo "\n✅ Database population completed!\n";
    echo "</pre>\n";
    
} catch (Exception $e) {
    echo "<h2>Error</h2>\n";
    echo "<pre>Error: " . $e->getMessage() . "</pre>\n";
}
?>
