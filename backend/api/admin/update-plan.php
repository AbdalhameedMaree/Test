<?php
require_once '../../config.php';

// Check if user is authenticated and is admin
requireAuth();
$user = getCurrentUser();
if ($user['role'] !== 'admin') {
    sendError('Access denied', 403);
}

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['id'])) {
    sendError('Plan ID is required');
}

try {
    $pdo = getDBConnection();
    
    // Build update query dynamically based on provided fields
    $updateFields = [];
    $params = [];
    
    $allowedFields = ['name', 'description', 'price', 'billing_period', 'features', 
                     'max_conversations', 'max_tokens', 'is_active'];
    
    foreach ($allowedFields as $field) {
        if (isset($input[$field])) {
            if ($field === 'features') {
                $updateFields[] = "$field = ?";
                $params[] = json_encode($input[$field]);
            } else {
                $updateFields[] = "$field = ?";
                $params[] = $input[$field];
            }
        }
    }
    
    if (empty($updateFields)) {
        sendError('No valid fields to update');
    }
    
    $params[] = $input['id'];
    
    $sql = "UPDATE plans SET " . implode(', ', $updateFields) . " WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    
    if ($stmt->rowCount() === 0) {
        sendError('Plan not found or no changes made', 404);
    }
    
    sendResponse(['message' => 'Plan updated successfully']);
    
} catch (Exception $e) {
    sendError('Failed to update plan: ' . $e->getMessage(), 500);
}
?>

