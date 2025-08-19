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
$required_fields = ['first_name', 'last_name'];
foreach ($required_fields as $field) {
    if (empty($input[$field])) {
        sendError("Field '$field' is required");
    }
}

try {
    $pdo = getDBConnection();
    $user_id = $_SESSION['user_id'];
    
    // Update user information
    $stmt = $pdo->prepare("
        UPDATE users 
        SET first_name = ?, last_name = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
    ");
    
    $stmt->execute([
        $input['first_name'],
        $input['last_name'],
        $user_id
    ]);
    
    sendResponse([
        'message' => 'Profile updated successfully',
        'user' => [
            'first_name' => $input['first_name'],
            'last_name' => $input['last_name']
        ]
    ]);
    
} catch (PDOException $e) {
    sendError('Failed to update profile: ' . $e->getMessage(), 500);
}
?>

