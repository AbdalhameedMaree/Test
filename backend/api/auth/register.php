<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../utils/mailer.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

$input = json_decode(file_get_contents('php://input'), true);

// Debug: Log the input
error_log("Registration input: " . json_encode($input));

// Validate required fields
$required_fields = ['first_name', 'last_name', 'email', 'password'];
foreach ($required_fields as $field) {
    if (empty($input[$field])) {
        sendError("Field '$field' is required");
    }
}

if (!validateEmail($input['email'])) {
    sendError('Invalid email format');
}

if (strlen($input['password']) < 8) {
    sendError('Password must be at least 8 characters long');
}

$role = 'customer';

try {
    $pdo = getDBConnection();

    // Check if email already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$input['email']]);
    if ($stmt->fetch()) {
        sendError('Email already registered');
    }

    $password_hash = hashPassword($input['password']);
    $token = generateRandomToken();
    $expires_at = date('Y-m-d H:i:s', strtotime('+10 minutes'));
    $now = date('Y-m-d H:i:s');

    // Debug: Log the values
    error_log("Registration values - Email: " . $input['email'] . ", Token: " . $token);

    // Save user
    $stmt = $pdo->prepare("
        INSERT INTO users (first_name, last_name, email, password_hash, role, verification_token, verification_token_expires_at, last_verification_sent_at, is_verified) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
    ");
    
    $result = $stmt->execute([
        $input['first_name'],
        $input['last_name'],
        $input['email'],
        $password_hash,
        $role,
        $token,
        $expires_at,
        $now
    ]);

    if (!$result) {
        throw new Exception("Failed to insert user: " . implode(", ", $stmt->errorInfo()));
    }

    $user_id = $pdo->lastInsertId();
    error_log("User created with ID: " . $user_id);

    // Try to send verification email
    try {
        sendVerificationEmail($input['email'], $input['first_name'], $token);
        error_log("Verification email sent successfully");
    } catch (Exception $e) {
        error_log("Email sending failed: " . $e->getMessage());
        // Continue anyway - user is created, they can resend verification
    }

    sendResponse([
        'message' => 'Account created. Please verify your email.',
        'user_id' => $user_id,
        'role' => $role
    ], 201);

} catch (PDOException $e) {
    error_log("Database error in registration: " . $e->getMessage());
    sendError('Registration failed: ' . $e->getMessage(), 500);
} catch (Exception $e) {
    error_log("General error in registration: " . $e->getMessage());
    sendError('Registration failed: ' . $e->getMessage(), 500);
}
?>