<?php
require_once '../../config.php';
require_once '../../utils/mailer.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

$input = json_decode(file_get_contents('php://input'), true);

// Validate input
$required_fields = ['name', 'email', 'message'];
foreach ($required_fields as $field) {
    if (empty($input[$field])) {
        sendError("Field '$field' is required");
    }
}

$name = trim($input['name']);
$email = trim(strtolower($input['email']));
$company = isset($input['company']) ? trim($input['company']) : null;
$message = trim($input['message']);

// Validate email format
if (!validateEmail($email)) {
    sendError('Invalid email format');
}

try {
    $pdo = getDBConnection();
    
    // Insert contact message
    $stmt = $pdo->prepare("
        INSERT INTO contact_messages (name, email, company, message) 
        VALUES (?, ?, ?, ?)
    ");
    $stmt->execute([$name, $email, $company, $message]);
    
    // Send notification email to admin
    sendContactNotificationEmail($name, $email, $company, $message);
    
    sendResponse([
        'message' => 'Thank you for your message! We\'ll get back to you within 24 hours.'
    ], 201);
    
} catch (PDOException $e) {
    sendError('Failed to submit message: ' . $e->getMessage(), 500);
} catch (Exception $e) {
    // Message was saved but email failed - still return success
    error_log('Contact email notification failed: ' . $e->getMessage());
    sendResponse([
        'message' => 'Thank you for your message! We\'ll get back to you within 24 hours.'
    ], 201);
}
?>

