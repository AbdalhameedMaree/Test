<?php
require_once '../../config.php';

// Check if user is authenticated and is admin
requireAuth();
$user = getCurrentUser();
if ($user['role'] !== 'admin') {
    sendError('Access denied', 403);
}

try {
    $pdo = getDBConnection();
    
    $stmt = $pdo->prepare("
        SELECT r.id, r.user_id, r.name, r.email, r.rating, r.title, r.content, 
               r.is_approved, r.is_featured, r.created_at, r.updated_at,
               u.first_name, u.last_name
        FROM reviews r
        LEFT JOIN users u ON r.user_id = u.id
        ORDER BY r.created_at DESC
    ");
    $stmt->execute();
    $reviews = $stmt->fetchAll();
    
    sendResponse(['reviews' => $reviews]);
    
} catch (Exception $e) {
    sendError('Failed to fetch reviews: ' . $e->getMessage(), 500);
}
?>

