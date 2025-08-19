<?php
require_once '../../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

// Check if user is authenticated and is an admin
requireRole('admin');

$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
$required_fields = ['name', 'rating', 'content'];
foreach ($required_fields as $field) {
    if (!isset($input[$field]) || $input[$field] === '') {
        sendError("Field '$field' is required");
    }
}

// Validate rating
if (!is_numeric($input['rating']) || $input['rating'] < 1 || $input['rating'] > 5) {
    sendError('Rating must be between 1 and 5');
}

// Validate email if provided
if (!empty($input['email']) && !validateEmail($input['email'])) {
    sendError('Invalid email format');
}

try {
    $pdo = getDBConnection();
    
    // Insert new review
    $stmt = $pdo->prepare("
        INSERT INTO reviews (name, email, rating, title, content, is_approved, is_featured) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    
    $stmt->execute([
        $input['name'],
        $input['email'] ?? null,
        $input['rating'],
        $input['title'] ?? '',
        $input['content'],
        $input['is_approved'] ?? 1,
        $input['is_featured'] ?? 0
    ]);
    
    $review_id = $pdo->lastInsertId();
    
    sendResponse([
        'message' => 'Review added successfully',
        'review_id' => $review_id
    ], 201);
    
} catch (PDOException $e) {
    sendError('Failed to add review: ' . $e->getMessage(), 500);
}
?>
