<?php
require_once '../../config.php';

// Check if user is authenticated
requireAuth();
$user = getCurrentUser();

// Get user ID from query parameter (for viewing other users' pictures)
$userId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : $user['id'];

// Only allow viewing own picture or if user is admin/employee
if ($userId !== $user['id'] && !in_array($user['role'], ['admin', 'employee'])) {
    sendError('Access denied', 403);
}

try {
    $pdo = getDBConnection();
    $stmt = $pdo->prepare("SELECT profile_picture FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $result = $stmt->fetch();
    
    if (!$result || !$result['profile_picture']) {
        sendError('No profile picture found', 404);
    }
    
    // Decrypt the image data
    $storedData = base64_decode($result['profile_picture']);
    $iv = substr($storedData, 0, 16);
    $encryptedData = substr($storedData, 16);
    
    $encryptionKey = hash('sha256', 'agentiq_profile_pictures_' . $userId, true);
    $imageData = openssl_decrypt($encryptedData, 'AES-256-CBC', $encryptionKey, 0, $iv);
    
    if ($imageData === false) {
        sendError('Failed to decrypt profile picture', 500);
    }
    
    // Detect image type
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_buffer($finfo, $imageData);
    finfo_close($finfo);
    
    // Set appropriate headers
    header('Content-Type: ' . $mimeType);
    header('Content-Length: ' . strlen($imageData));
    header('Cache-Control: private, max-age=3600');
    
    echo $imageData;
    
} catch (Exception $e) {
    sendError('Failed to retrieve profile picture: ' . $e->getMessage(), 500);
}
?>

