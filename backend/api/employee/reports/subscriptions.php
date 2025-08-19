<?php
require_once '../../../config.php';

requireAuth();
$user = getCurrentUser();
if ($user['role'] !== 'employee' && $user['role'] !== 'admin') {
    sendError('Access denied', 403);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

try {
    $pdo = getDBConnection();

    // Get subscription data for report
    $stmt = $pdo->query("
        SELECT 
            s.id,
            CONCAT(u.first_name, ' ', u.last_name) as customer_name,
            u.email,
            p.name as plan_name,
            p.price,
            p.billing_period,
            s.status,
            s.start_date,
            s.end_date,
            s.created_at
        FROM subscriptions s
        JOIN users u ON s.user_id = u.id
        JOIN plans p ON s.plan_id = p.id
        ORDER BY s.created_at DESC
    ");
    $subscriptions = $stmt->fetchAll();

    // Generate CSV content
    $csv = "ID,Customer Name,Email,Plan,Price,Billing Period,Status,Start Date,End Date,Created Date\n";
    
    foreach ($subscriptions as $sub) {
        $csv .= sprintf(
            "%d,\"%s\",\"%s\",\"%s\",%.2f,\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"\n",
            $sub['id'],
            $sub['customer_name'],
            $sub['email'],
            $sub['plan_name'],
            $sub['price'],
            $sub['billing_period'],
            $sub['status'],
            $sub['start_date'],
            $sub['end_date'] ?? '',
            $sub['created_at']
        );
    }

    // Set headers for file download
    header('Content-Type: text/csv');
    header('Content-Disposition: attachment; filename="subscriptions_report_' . date('Y-m-d') . '.csv"');
    header('Content-Length: ' . strlen($csv));
    
    echo $csv;
    exit;

} catch (Exception $e) {
    error_log("Subscriptions report error: " . $e->getMessage());
    sendError('Failed to generate subscriptions report', 500);
}
?>
