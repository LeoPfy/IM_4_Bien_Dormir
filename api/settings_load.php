<?php
// api/settings_load.php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Nicht eingeloggt']);
    exit;
}

require_once '../system/config.php';

$stmt = $pdo->prepare("SELECT * FROM user_settings WHERE user_id = :uid");
$stmt->execute([':uid' => $_SESSION['user_id']]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);

// Falls noch keine Settings existieren → Standardwerte zurückgeben
if (!$row) {
    echo json_encode([
        'status'    => 'success',
        'temp_min'  => 18.0,
        'temp_max'  => 22.0,
        'hum_min'   => 40,
        'hum_max'   => 60,
        'noise_max' => 40,
    ]);
} else {
    echo json_encode([
        'status'    => 'success',
        'temp_min'  => (float) $row['temp_min'],
        'temp_max'  => (float) $row['temp_max'],
        'hum_min'   => (int)   $row['hum_min'],
        'hum_max'   => (int)   $row['hum_max'],
        'noise_max' => (int)   $row['noise_max'],
    ]);
}
