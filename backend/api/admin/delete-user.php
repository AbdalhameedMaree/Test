<?php
require_once '../../config.php';

// Check if user is admin
requireRole('admin');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

// Get input data
$input = json_decode(file_get_contents('php://input'), true);
$userId = $input['id'] ?? null;

if (!$userId) {
    sendError('User ID is required', 400);
}

try {
    $pdo = getDBConnection();
    
    // Don't allow deletion of the current admin user
    $currentUser = getCurrentUser();
    if ($userId == $currentUser['id']) {
        sendError('Cannot delete your own account', 400);
    }
    
    // Check if user exists
    $stmt = $pdo->prepare("SELECT id, role FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
    
    if (!$user) {
        sendError('User not found', 404);
    }
    
    // Don't allow deletion of other admin users (optional security measure)
    if ($user['role'] === 'admin') {
        sendError('Cannot delete admin users', 400);
    }
    
    // Delete the user (CASCADE will handle related records)
    $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    
    if ($stmt->rowCount() > 0) {
        sendResponse(['message' => 'User deleted successfully']);
    } else {
        sendError('Failed to delete user', 500);
    }
    
} catch (PDOException $e) {
    error_log("Delete user error: " . $e->getMessage());
    sendError('Failed to delete user: ' . $e->getMessage(), 500);
}
?>
