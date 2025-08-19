<?php
require_once 'backend/config.php';

try {
    $pdo = getDBConnection();
    
    echo "<h2>Monthly Revenue API Test</h2>\n";
    echo "<pre>\n";
    
    // Test the exact query from get-statistics.php
    echo "=== TESTING GET-STATISTICS API ===\n";
    
    $url = 'https://agent-eq.com/backend/api/admin/get-statistics.php';
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "HTTP Code: $httpCode\n";
    
    if ($response) {
        $data = json_decode($response, true);
        if ($data && isset($data['statistics']['monthly_revenue'])) {
            echo "Monthly Revenue Data from API:\n";
            echo json_encode($data['statistics']['monthly_revenue'], JSON_PRETTY_PRINT);
        } else {
            echo "API Response:\n";
            echo substr($response, 0, 1000) . "\n";
        }
    } else {
        echo "No response from API\n";
    }
    
    echo "\n=== DIRECT DATABASE QUERY ===\n";
    
    // Show exactly what months have data
    $stmt = $pdo->query("
        SELECT 
            DATE_FORMAT(created_at, '%Y-%m') as month,
            SUM(amount) as revenue,
            COUNT(*) as payment_count
        FROM billing_history 
        WHERE status = 'completed'
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month DESC
    ");
    $months = $stmt->fetchAll();
    
    echo "Months with actual data:\n";
    foreach ($months as $month) {
        echo "Month: {$month['month']} | Revenue: \${$month['revenue']} | Payments: {$month['payment_count']}\n";
    }
    
    echo "\n=== WHAT THE CHART SHOULD SHOW ===\n";
    
    // Create the correct monthly revenue array
    $correctData = [];
    foreach (array_reverse($months) as $month) {
        $correctData[] = [
            'month' => $month['month'],
            'revenue' => (float)$month['revenue']
        ];
    }
    
    echo "Correct chart data:\n";
    echo json_encode($correctData, JSON_PRETTY_PRINT);
    
    echo "</pre>\n";
    
} catch (Exception $e) {
    echo "<h2>Error</h2>\n";
    echo "<pre>Error: " . $e->getMessage() . "</pre>\n";
}
?>
