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
    sendError('Review ID is required');
}

try {
    $pdo = getDBConnection();
    
    // Build update query dynamically based on provided fields
    $updateFields = [];
    $params = [];
    
    $allowedFields = ['name', 'email', 'rating', 'title', 'content', 'is_approved', 'is_featured'];
    
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
    
    $sql = "UPDATE reviews SET " . implode(', ', $updateFields) . " WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    
    if ($stmt->rowCount() === 0) {
        sendError('Review not found or no changes made', 404);
    }
    
    sendResponse(['message' => 'Review updated successfully']);
    
} catch (Exception $e) {
    sendError('Failed to update review: ' . $e->getMessage(), 500);
}
?>

