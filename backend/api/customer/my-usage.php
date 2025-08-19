<?php
require_once '../../config.php';

requireAuth();

try {
    $pdo = getDBConnection();
    $user = getCurrentUser();
    
    if (!$user) {
        sendError('User not found', 404);
    }

    // Get current month usage
    $currentMonth = date('Y-m');
    
    $stmt = $pdo->prepare("
        SELECT 
            month_year,
            conversations_used,
            tokens_used,
            created_at,
            updated_at
        FROM user_usage 
        WHERE user_id = ? AND month_year = ?
    ");
    $stmt->execute([$user['id'], $currentMonth]);
    $currentUsage = $stmt->fetch();

    // Get user's subscription for limits
    $stmt = $pdo->prepare("
        SELECT 
            s.id,
            s.status,
            s.start_date,
            s.end_date,
            p.name as plan_name,
            p.max_conversations,
            p.max_tokens,
            p.price,
            p.billing_period
        FROM subscriptions s
        JOIN plans p ON s.plan_id = p.id
        WHERE s.user_id = ? AND s.status = 'active'
        ORDER BY s.created_at DESC
        LIMIT 1
    ");
    $stmt->execute([$user['id']]);
    $subscription = $stmt->fetch();

    // Get usage history (last 6 months)
    $stmt = $pdo->prepare("
        SELECT 
            month_year,
            conversations_used,
            tokens_used
        FROM user_usage 
        WHERE user_id = ? 
        ORDER BY month_year DESC 
        LIMIT 6
    ");
    $stmt->execute([$user['id']]);
    $usageHistory = $stmt->fetchAll();

    sendResponse([
        'current_usage' => $currentUsage ?: [
            'month_year' => $currentMonth,
            'conversations_used' => 0,
            'tokens_used' => 0
        ],
        'subscription' => $subscription,
        'usage_history' => $usageHistory,
        'limits' => [
            'max_conversations' => $subscription['max_conversations'] ?? null,
            'max_tokens' => $subscription['max_tokens'] ?? null,
            'conversations_remaining' => $subscription['max_conversations'] ? 
                max(0, $subscription['max_conversations'] - ($currentUsage['conversations_used'] ?? 0)) : null,
            'tokens_remaining' => $subscription['max_tokens'] ? 
                max(0, $subscription['max_tokens'] - ($currentUsage['tokens_used'] ?? 0)) : null
        ]
    ]);

} catch (Exception $e) {
    error_log("Usage API error: " . $e->getMessage());
    sendError('Failed to get usage data', 500);
}
?>
