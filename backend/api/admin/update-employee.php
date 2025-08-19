<?php
require_once '../../config.php';

// Check if user is authenticated and is an admin
requireRole('admin');

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['id'])) {
    sendError('Employee ID is required');
}

try {
    $pdo = getDBConnection();
    
    // Build update query dynamically based on provided fields
    $updateFields = [];
    $params = [];
    
    $allowedFields = ['first_name', 'last_name', 'email', 'is_verified'];
    
    foreach ($allowedFields as $field) {
        if (isset($input[$field])) {
            $updateFields[] = "$field = ?";
            $params[] = $input[$field];
        }
    }
    
    if (empty($updateFields)) {
        sendError('No valid fields to update');
    }
    
    $params[] = $input['id'];
    
    // Make sure we're only updating employees
    $sql = "UPDATE users SET " . implode(', ', $updateFields) . " WHERE id = ? AND role = 'employee'";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    
    if ($stmt->rowCount() === 0) {
        sendError('Employee not found or no changes made', 404);
    }
    
    sendResponse(['message' => 'Employee updated successfully']);
    
} catch (Exception $e) {
    sendError('Failed to update employee: ' . $e->getMessage(), 500);
}
?>
