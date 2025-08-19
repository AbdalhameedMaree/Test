<?php
require_once '../../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError('Method not allowed', 405);
}

$user = getCurrentUser();

if ($user) {
    sendResponse([
        'authenticated' => true,
        'user' => $user
    ]);
} else {
    sendResponse([
        'authenticated' => false
    ]);
}
?>

