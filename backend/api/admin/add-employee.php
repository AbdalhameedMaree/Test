<?php
require_once '../../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

// Check if user is authenticated and is an admin
$currentUser = getCurrentUser();
if (!$currentUser) {
    sendError('Authentication required', 401);
}

// Get user role from database
$pdo = getDBConnection();
$stmt = $pdo->prepare("SELECT role FROM users WHERE id = ?");
$stmt->execute([$currentUser['id']]);
$userRole = $stmt->fetchColumn();

if ($userRole !== 'admin') {
    sendError('Admin access required', 403);
}

$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
$required_fields = ['first_name', 'last_name', 'email', 'password'];
foreach ($required_fields as $field) {
    if (empty($input[$field])) {
        sendError("Field '$field' is required");
    }
}

// Validate email format
if (!validateEmail($input['email'])) {
    sendError('Invalid email format');
}

// Validate password strength
if (strlen($input['password']) < 8) {
    sendError('Password must be at least 8 characters long');
}

// Set role to 'employee'
$role = 'employee';

try {
    // Check if email already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$input['email']]);
    if ($stmt->fetch()) {
        sendError('Email already registered');
    }
    
    // Hash password
    $password_hash = hashPassword($input['password']);
    
    // Insert new employee (auto-verified since added by admin)
    $stmt = $pdo->prepare("
        INSERT INTO users (first_name, last_name, email, password_hash, role, is_verified) 
        VALUES (?, ?, ?, ?, ?, 1)
    ");
    
    $stmt->execute([
        $input['first_name'],
        $input['last_name'],
        $input['email'],
        $password_hash,
        $role
    ]);
    
    $user_id = $pdo->lastInsertId();
    
    sendResponse([
        'message' => 'Employee added successfully',
        'user_id' => $user_id,
        'role' => $role
    ], 201);
    
} catch (PDOException $e) {
    sendError('Failed to add employee: ' . $e->getMessage(), 500);
}
?>

