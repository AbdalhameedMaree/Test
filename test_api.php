<?php
require_once 'backend/config.php';

// Start session and simulate admin login
session_start();
$_SESSION['user_id'] = 1;
$_SESSION['user_role'] = 'admin';
$_SESSION['user_email'] = 'admin@agenteq.com';

try {
    // Test the API call
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'http://localhost:8000/backend/api/admin/get-statistics.php');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_COOKIE, session_name() . '=' . session_id());
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "<h2>API Test Results</h2>\n";
    echo "<h3>HTTP Code: $httpCode</h3>\n";
    echo "<pre>\n";
    
    if ($response) {
        $data = json_decode($response, true);
        if ($data) {
            echo "API Response:\n";
            echo json_encode($data, JSON_PRETTY_PRINT);
            
            if (isset($data['statistics']['overview'])) {
                $overview = $data['statistics']['overview'];
                echo "\n\n=== Key Statistics ===\n";
                echo "Total Revenue: \$" . number_format($overview['total_revenue'], 2) . "\n";
                echo "Active Subscriptions: " . $overview['active_subscriptions'] . "\n";
                echo "Total Users: " . $overview['total_users'] . "\n";
                
                if (isset($data['statistics']['monthly_revenue'])) {
                    echo "\n=== Monthly Revenue Data ===\n";
                    foreach ($data['statistics']['monthly_revenue'] as $month) {
                        echo "Month: {$month['month']}, Revenue: \${$month['revenue']}\n";
                    }
                } else {
                    echo "\n❌ No monthly revenue data found\n";
                }
            }
        } else {
            echo "Failed to decode JSON response:\n";
            echo $response;
        }
    } else {
        echo "No response from API\n";
    }
    
    echo "</pre>\n";
    echo "<br><a href='admin-dashboard.html' style='background: #00d4ff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px;'>Go to Dashboard</a>";
    
} catch (Exception $e) {
    echo "<h2>Error</h2>\n";
    echo "<pre>Error: " . $e->getMessage() . "</pre>\n";
}
?>
