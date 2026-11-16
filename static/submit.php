<?php
/**
 * Contact form handler for York Computer Help.
 * Receives POST data, forwards to the Clientably (LeadConnector/GHL) webhook,
 * redirects to the thank-you page.
 */

define('WEBHOOK_URL', 'https://services.leadconnectorhq.com/hooks/5KgnAuxR3KkJGeb8jS12/webhook-trigger/f4cc95f8-add3-41de-8565-cc1c69eb6ba3');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: /#contact');
    exit;
}

// Collect and sanitize form data
$fields = ['name', 'email', 'phone', 'message'];
$data = [];
foreach ($fields as $field) {
    $data[$field] = isset($_POST[$field]) ? htmlspecialchars(trim($_POST[$field]), ENT_QUOTES, 'UTF-8') : '';
}

// Validate required fields (matches the form's required attributes)
if (empty($data['name']) || empty($data['email']) || empty($data['message'])) {
    header('Location: /#contact');
    exit;
}

// Forward to webhook
$ch = curl_init(WEBHOOK_URL);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
curl_exec($ch);
curl_close($ch);

// Redirect to thank-you page regardless of webhook response
header('Location: /thank-you/');
exit;
