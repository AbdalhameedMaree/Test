<?php
require_once '../../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

// Check if user is authenticated and is an admin
requireRole('admin');

$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
$required_fields = ['name', 'price', 'billing_period'];
foreach ($required_fields as $field) {
    if (!isset($input[$field]) || $input[$field] === '') {
        sendError("Field '$field' is required");
    }
}

// Validate price
if (!is_numeric($input['price']) || $input['price'] < 0) {
    sendError('Price must be a valid positive number');
}

// Validate billing period
$allowed_periods = ['monthly', 'yearly'];
if (!in_array($input['billing_period'], $allowed_periods)) {
    sendError('Invalid billing period');
}

try {
    $pdo = getDBConnection();
    
    // Check if plan name already exists for this billing period
    $stmt = $pdo->prepare("SELECT id FROM plans WHERE name = ? AND billing_period = ?");
    $stmt->execute([$input['name'], $input['billing_period']]);
    if ($stmt->fetch()) {
        sendError('Plan with this name and billing period already exists');
    }
    
    // Prepare features JSON
    $features = $input['features'] ?? ['Basic Features'];
    if (!is_array($features)) {
        $features = [$features];
    }
    
    // Insert new plan
    $stmt = $pdo->prepare("
        INSERT INTO plans (name, description, price, billing_period, features, max_conversations, max_tokens, is_active) 
        VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    ");
    
    $stmt->execute([
        $input['name'],
        $input['description'] ?? '',
        $input['price'],
        $input['billing_period'],
        json_encode($features),
        $input['max_conversations'] ?? null,
        $input['max_tokens'] ?? null
    ]);
    
    $plan_id = $pdo->lastInsertId();
    
    sendResponse([
        'message' => 'Plan added successfully',
        'plan_id' => $plan_id
    ], 201);
    
} catch (PDOException $e) {
    sendError('Failed to add plan: ' . $e->getMessage(), 500);
}
?>
