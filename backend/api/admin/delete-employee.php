<?php
require_once '../../config.php';

requireAuth();
$user = getCurrentUser();
if ($user['role'] !== 'admin') {
    sendError('Access denied', 403);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

$input = json_decode(file_get_contents('php://input'), true);

if (empty($input['id'])) {
    sendError('Employee ID is required');
}

try {
    $pdo = getDBConnection();

    // Check if employee exists and is actually an employee
    $stmt = $pdo->prepare("SELECT id, role FROM users WHERE id = ? AND role = 'employee'");
    $stmt->execute([$input['id']]);
    $employee = $stmt->fetch();

    if (!$employee) {
        sendError('Employee not found', 404);
    }

    // Delete employee (this will cascade delete related data due to foreign keys)
    $stmt = $pdo->prepare("DELETE FROM users WHERE id = ? AND role = 'employee'");
    $result = $stmt->execute([$input['id']]);

    if ($result) {
        sendResponse([
            'success' => true,
            'message' => 'Employee deleted successfully'
        ]);
    } else {
        sendError('Failed to delete employee', 500);
    }

} catch (Exception $e) {
    error_log("Delete employee error: " . $e->getMessage());
    sendError('Failed to delete employee: ' . $e->getMessage(), 500);
}
?>
