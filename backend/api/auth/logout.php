<?php
require_once '../../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

// Destroy session
session_destroy();

sendResponse([
    'message' => 'Logged out successfully'
]);
?>

