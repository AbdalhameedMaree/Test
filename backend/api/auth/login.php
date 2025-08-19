<?php
require_once '../../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

$input = json_decode(file_get_contents('php://input'), true);

// Validate input
if (empty($input['email']) || empty($input['password'])) {
    sendError('Email and password are required');
}

$email = trim(strtolower($input['email']));
$password = $input['password'];

try {
    $pdo = getDBConnection();
    
    // Find user by email and include role
    $stmt = $pdo->prepare("SELECT id, first_name, last_name, email, password_hash, role FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    if (!$user) {
        sendError('Invalid email or password');
    }
    
    // Verify password
    if (!verifyPassword($password, $user['password_hash'])) {
        sendError('Invalid email or password');
    }
    
    // Create session
    $_SESSION['user_id'] = $user['id'];
    
    // Return user data (without password hash)
    unset($user['password_hash']);
    
    sendResponse([
        'message' => 'Login successful',
        'user' => $user
    ]);
    
} catch (PDOException $e) {
    sendError('Login failed: ' . $e->getMessage(), 500);
}
?>

