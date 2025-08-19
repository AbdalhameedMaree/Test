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

    // Get customer data for report
    $stmt = $pdo->query("
        SELECT 
            u.id,
            u.first_name,
            u.last_name,
            u.email,
            u.is_verified,
            u.created_at,
            COUNT(s.id) as subscription_count,
            MAX(s.created_at) as last_subscription_date,
            COALESCE(SUM(CASE WHEN s.status = 'active' THEN p.price ELSE 0 END), 0) as active_revenue
        FROM users u
        LEFT JOIN subscriptions s ON u.id = s.user_id
        LEFT JOIN plans p ON s.plan_id = p.id
        WHERE u.role = 'customer'
        GROUP BY u.id, u.first_name, u.last_name, u.email, u.is_verified, u.created_at
        ORDER BY u.created_at DESC
    ");
    $customers = $stmt->fetchAll();

    // Generate CSV content
    $csv = "ID,First Name,Last Name,Email,Verified,Registration Date,Subscriptions Count,Last Subscription,Active Revenue\n";
    
    foreach ($customers as $customer) {
        $csv .= sprintf(
            "%d,\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",%d,\"%s\",%.2f\n",
            $customer['id'],
            $customer['first_name'],
            $customer['last_name'],
            $customer['email'],
            $customer['is_verified'] ? 'Yes' : 'No',
            $customer['created_at'],
            $customer['subscription_count'],
            $customer['last_subscription_date'] ?? '',
            $customer['active_revenue']
        );
    }

    // Set headers for file download
    header('Content-Type: text/csv');
    header('Content-Disposition: attachment; filename="customers_report_' . date('Y-m-d') . '.csv"');
    header('Content-Length: ' . strlen($csv));
    
    echo $csv;
    exit;

} catch (Exception $e) {
    error_log("Customers report error: " . $e->getMessage());
    sendError('Failed to generate customers report', 500);
}
?>
