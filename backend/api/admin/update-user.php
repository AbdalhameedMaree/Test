<?php
require_once '../../config.php';

// Check if user is authenticated and is an admin
requireRole('admin');

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['id'])) {
    sendError('User ID is required');
}

try {
    $pdo = getDBConnection();
    
    // Build update query dynamically based on provided fields
    $updateFields = [];
    $params = [];
    
    $allowedFields = ['first_name', 'last_name', 'email', 'role', 'is_verified'];
    
    foreach ($allowedFields as $field) {
        if (isset($input[$field])) {
            // Validate role if being updated
            if ($field === 'role') {
                $allowed_roles = ['admin', 'employee', 'customer'];
                if (!in_array($input[$field], $allowed_roles)) {
                    sendError('Invalid role specified');
                }
            }
            // Validate email if being updated
            if ($field === 'email' && !validateEmail($input[$field])) {
                sendError('Invalid email format');
            }
            
            $updateFields[] = "$field = ?";
            $params[] = $input[$field];
        }
    }
    
    if (empty($updateFields)) {
        sendError('No valid fields to update');
    }
    
    $params[] = $input['id'];
    
    $sql = "UPDATE users SET " . implode(', ', $updateFields) . " WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    
    if ($stmt->rowCount() === 0) {
        sendError('User not found or no changes made', 404);
    }
    
    sendResponse(['message' => 'User updated successfully']);
    
} catch (Exception $e) {
    sendError('Failed to update user: ' . $e->getMessage(), 500);
}
?>
