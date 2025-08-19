<?php
require_once '../../config.php';

// Check if user is customer
requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError('Method not allowed', 405);
}

try {
    $pdo = getDBConnection();
    $user_id = $_SESSION['user_id'];
    
    // Get current month's usage
    $current_month_year = date('Y-m');
    $stmt = $pdo->prepare("
        SELECT conversations_used, tokens_used
        FROM user_usage
        WHERE user_id = ? AND month_year = ?
    ");
    $stmt->execute([$user_id, $current_month_year]);
    $current_usage = $stmt->fetch();
    
    $conversations_current_month = $current_usage ? (int)$current_usage['conversations_used'] : 0;
    $tokens_current_month = $current_usage ? (int)$current_usage['tokens_used'] : 0;

    // Get last month's usage
    $last_month_year = date('Y-m', strtotime('-1 month'));
    $stmt = $pdo->prepare("
        SELECT conversations_used, tokens_used
        FROM user_usage
        WHERE user_id = ? AND month_year = ?
    ");
    $stmt->execute([$user_id, $last_month_year]);
    $last_usage = $stmt->fetch();

    $conversations_last_month = $last_usage ? (int)$last_usage['conversations_used'] : 0;
    $tokens_last_month = $last_usage ? (int)$last_usage['tokens_used'] : 0;

    // For daily data, we'd need a more granular table, but for now, we'll just return monthly summaries.
    // If daily data is required, a new table like 'daily_usage' would be needed.
    
    sendResponse([
        'usage' => [
            'current_month_conversations' => $conversations_current_month,
            'current_month_tokens' => $tokens_current_month,
            'last_month_conversations' => $conversations_last_month,
            'last_month_tokens' => $tokens_last_month,
            'daily_data' => [] // Placeholder for now
        ]
    ]);
    
} catch (PDOException $e) {
    sendError('Failed to fetch usage data: ' . $e->getMessage(), 500);
}
?>


