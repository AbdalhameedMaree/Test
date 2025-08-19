<?php
require_once '../../config.php';

try {
    $pdo = getDBConnection();
    
    $stmt = $pdo->prepare("
        SELECT id, name, rating, title, content, is_featured, created_at
        FROM reviews 
        WHERE is_approved = TRUE
        ORDER BY is_featured DESC, created_at DESC
        LIMIT 50
    ");
    $stmt->execute();
    $reviews = $stmt->fetchAll();
    
    sendResponse(['reviews' => $reviews]);
    
} catch (Exception $e) {
    sendError('Failed to fetch reviews: ' . $e->getMessage(), 500);
}
?>

