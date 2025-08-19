<?php
require_once 'backend/config.php';

try {
    $pdo = getDBConnection();
    
    // Check if admin user exists
    $stmt = $pdo->prepare("SELECT id, first_name, last_name, email, role FROM users WHERE role = 'admin'");
    $stmt->execute();
    $admins = $stmt->fetchAll();
    
    echo "Found " . count($admins) . " admin users:\n";
    foreach ($admins as $admin) {
        echo "ID: {$admin['id']}, Name: {$admin['first_name']} {$admin['last_name']}, Email: {$admin['email']}\n";
    }
    
    // Check all users
    $stmt = $pdo->prepare("SELECT id, first_name, last_name, email, role FROM users ORDER BY id");
    $stmt->execute();
    $users = $stmt->fetchAll();
    
    echo "\nAll users in database:\n";
    foreach ($users as $user) {
        echo "ID: {$user['id']}, Name: {$user['first_name']} {$user['last_name']}, Email: {$user['email']}, Role: {$user['role']}\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
