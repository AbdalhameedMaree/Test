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

    // Get revenue data for report
    $stmt = $pdo->query("
        SELECT 
            bh.id,
            bh.amount,
            bh.currency,
            bh.payment_method,
            bh.transaction_id,
            bh.status,
            bh.billing_date,
            CONCAT(u.first_name, ' ', u.last_name) as customer_name,
            u.email,
            p.name as plan_name,
            p.billing_period
        FROM billing_history bh
        JOIN users u ON bh.user_id = u.id
        JOIN subscriptions s ON bh.subscription_id = s.id
        JOIN plans p ON s.plan_id = p.id
        ORDER BY bh.billing_date DESC
    ");
    $revenues = $stmt->fetchAll();

    // Calculate totals
    $totalRevenue = 0;
    $monthlyRevenue = 0;
    $currentMonth = date('Y-m');
    
    foreach ($revenues as $revenue) {
        if ($revenue['status'] === 'completed') {
            $totalRevenue += $revenue['amount'];
            $billingMonth = date('Y-m', strtotime($revenue['billing_date']));
            if ($billingMonth === $currentMonth) {
                $monthlyRevenue += $revenue['amount'];
            }
        }
    }

    // Generate CSV content
    $csv = "ID,Amount,Currency,Payment Method,Transaction ID,Status,Billing Date,Customer,Email,Plan,Billing Period\n";
    
    foreach ($revenues as $revenue) {
        $csv .= sprintf(
            "%d,%.2f,\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"\n",
            $revenue['id'],
            $revenue['amount'],
            $revenue['currency'],
            $revenue['payment_method'],
            $revenue['transaction_id'],
            $revenue['status'],
            $revenue['billing_date'],
            $revenue['customer_name'],
            $revenue['email'],
            $revenue['plan_name'],
            $revenue['billing_period']
        );
    }

    // Add summary at the end
    $csv .= "\n";
    $csv .= "SUMMARY\n";
    $csv .= "Total Revenue (All Time),{$totalRevenue}\n";
    $csv .= "Revenue This Month,{$monthlyRevenue}\n";
    $csv .= "Total Transactions," . count($revenues) . "\n";

    // Set headers for file download
    header('Content-Type: text/csv');
    header('Content-Disposition: attachment; filename="revenue_report_' . date('Y-m-d') . '.csv"');
    header('Content-Length: ' . strlen($csv));
    
    echo $csv;
    exit;

} catch (Exception $e) {
    error_log("Revenue report error: " . $e->getMessage());
    sendError('Failed to generate revenue report', 500);
}
?>
