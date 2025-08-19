<?php
// Direct test to see what's happening with the monthly revenue data
require_once 'backend/config.php';

try {
    $pdo = getDBConnection();
    
    echo "<h2>Monthly Revenue Debug - Live API Test</h2>\n";
    echo "<pre>\n";
    
    // Test the exact same logic as get-statistics.php
    echo "=== STEP 1: Raw billing data ===\n";
    $stmt = $pdo->query("
        SELECT 
            id,
            user_id,
            subscription_id,
            amount,
            status,
            created_at,
            DATE_FORMAT(created_at, '%Y-%m') as month
        FROM billing_history 
        WHERE status = 'completed'
        ORDER BY created_at
    ");
    $rawData = $stmt->fetchAll();
    
    echo "Raw billing records:\n";
    foreach ($rawData as $row) {
        echo "ID: {$row['id']} | Month: {$row['month']} | Amount: \${$row['amount']} | Date: {$row['created_at']}\n";
    }
    
    echo "\n=== STEP 2: Monthly aggregation ===\n";
    $stmt = $pdo->query("
        SELECT 
            DATE_FORMAT(created_at, '%Y-%m') as month,
            SUM(amount) as revenue
        FROM billing_history 
        WHERE status = 'completed'
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month ASC
    ");
    $monthlyData = $stmt->fetchAll();
    
    echo "Monthly aggregated data:\n";
    foreach ($monthlyData as $month) {
        echo "Month: {$month['month']} | Revenue: \${$month['revenue']}\n";
    }
    
    echo "\n=== STEP 3: Format for API ===\n";
    $monthlyRevenue = [];
    foreach ($monthlyData as $month) {
        $monthlyRevenue[] = [
            'month' => $month['month'],
            'revenue' => (float)$month['revenue']
        ];
    }
    
    echo "Formatted for chart:\n";
    echo json_encode($monthlyRevenue, JSON_PRETTY_PRINT);
    
    echo "\n=== STEP 4: Test actual API call ===\n";
    
    // Make actual API call
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'http://localhost:8080/backend/api/admin/get-statistics.php');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, false);
    
    // Add authentication headers if needed
    curl_setopt($ch, CURLOPT_COOKIE, session_name() . '=' . session_id());
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "API Response Code: $httpCode\n";
    
    if ($response) {
        $apiData = json_decode($response, true);
        if ($apiData && isset($apiData['statistics']['monthly_revenue'])) {
            echo "API Monthly Revenue Data:\n";
            echo json_encode($apiData['statistics']['monthly_revenue'], JSON_PRETTY_PRINT);
        } else {
            echo "API Response (first 500 chars):\n";
            echo substr($response, 0, 500) . "\n";
        }
    } else {
        echo "No response from API\n";
    }
    
    echo "</pre>\n";
    
} catch (Exception $e) {
    echo "<h2>Error</h2>\n";
    echo "<pre>Error: " . $e->getMessage() . "</pre>\n";
}
?>
