<?php
require_once '../../config.php';

// Check if user is authenticated
requireAuth();
$user = getCurrentUser();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

if (!isset($_FILES['profile_picture'])) {
    sendError('No file uploaded');
}

$file = $_FILES['profile_picture'];

// Validate file
if ($file['error'] !== UPLOAD_ERR_OK) {
    sendError('File upload error');
}

// Check file type
$allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mimeType, $allowedTypes)) {
    sendError('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
}

// Check file size (max 5MB)
if ($file['size'] > 5 * 1024 * 1024) {
    sendError('File size too large. Maximum 5MB allowed.');
}

try {
    // Read file content
    $imageData = file_get_contents($file['tmp_name']);
    
    // Encrypt the image data
    $encryptionKey = hash('sha256', 'agentiq_profile_pictures_' . $user['id'], true);
    $iv = openssl_random_pseudo_bytes(16);
    $encryptedData = openssl_encrypt($imageData, 'AES-256-CBC', $encryptionKey, 0, $iv);
    
    // Combine IV and encrypted data for storage
    $storedData = base64_encode($iv . $encryptedData);
    
    // Update user's profile picture in database
    $pdo = getDBConnection();
    $stmt = $pdo->prepare("UPDATE users SET profile_picture = ? WHERE id = ?");
    $stmt->execute([$storedData, $user['id']]);
    
    sendResponse(['message' => 'Profile picture updated successfully']);
    
} catch (Exception $e) {
    sendError('Failed to upload profile picture: ' . $e->getMessage(), 500);
}
?>

