<?php
require_once 'backend/config.php';

header('Content-Type: application/json');

try {
    $pdo = getDBConnection();
    
    // Get monthly revenue data - show actual months with data
    $stmt = $pdo->query("
        SELECT 
            DATE_FORMAT(created_at, '%Y-%m') as month,
            SUM(amount) as revenue
        FROM billing_history 
        WHERE status = 'completed'
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month ASC
    ");
    $monthlyRevenue = $stmt->fetchAll();
    
    // Convert to proper format
    foreach ($monthlyRevenue as &$month) {
        $month['revenue'] = (float)$month['revenue'];
    }
    unset($month);
    
    // If no data, show last 6 months with zero values
    if (empty($monthlyRevenue)) {
        $monthlyRevenue = [];
        $currentDate = new DateTime();
        
        for ($i = 5; $i >= 0; $i--) {
            $date = clone $currentDate;
            $date->modify("-$i month");
            $monthlyRevenue[] = [
                'month' => $date->format('Y-m'),
                'revenue' => 0
            ];
        }
    }
    
    echo json_encode([
        'success' => true,
        'monthly_revenue' => $monthlyRevenue
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
