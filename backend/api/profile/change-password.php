<?php
require_once '../../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

// Check authentication
if (!isLoggedIn()) {
    sendError('Authentication required', 401);
}

$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
$required_fields = ['current_password', 'new_password'];
foreach ($required_fields as $field) {
    if (empty($input[$field])) {
        sendError("Field '$field' is required");
    }
}

// Validate new password strength
if (strlen($input['new_password']) < 8) {
    sendError('New password must be at least 8 characters long');
}

try {
    $pdo = getDBConnection();
    $user_id = $_SESSION['user_id'];
    
    // Get current user data
    $stmt = $pdo->prepare("SELECT password_hash FROM users WHERE id = ?");
    $stmt->execute([$user_id]);
    $user = $stmt->fetch();
    
    if (!$user) {
        sendError('User not found', 404);
    }
    
    // Verify current password
    if (!verifyPassword($input['current_password'], $user['password_hash'])) {
        sendError('Current password is incorrect');
    }
    
    // Hash new password
    $new_password_hash = hashPassword($input['new_password']);
    
    // Update password
    $stmt = $pdo->prepare("
        UPDATE users 
        SET password_hash = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
    ");
    
    $stmt->execute([$new_password_hash, $user_id]);
    
    sendResponse([
        'message' => 'Password updated successfully'
    ]);
    
} catch (PDOException $e) {
    sendError('Failed to update password: ' . $e->getMessage(), 500);
}
?>

