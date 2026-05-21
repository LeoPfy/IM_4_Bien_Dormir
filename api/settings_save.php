<?php
// api/settings_save.php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Nicht eingeloggt']);
    exit;
}

require_once '../system/config.php';

$data = json_decode(file_get_contents('php://input'), true);

$temp_min  = floatval($data['temp_min']  ?? 18);
$temp_max  = floatval($data['temp_max']  ?? 22);
$hum_min   = intval($data['hum_min']     ?? 40);
$hum_max   = intval($data['hum_max']     ?? 60);
$noise_max = intval($data['noise_max']   ?? 40);

// Validierung
if ($temp_min >= $temp_max || $hum_min >= $hum_max) {
    echo json_encode(['status' => 'error', 'message' => 'Min-Wert muss kleiner als Max-Wert sein.']);
    exit;
}

// INSERT oder UPDATE (UPSERT)
$stmt = $pdo->prepare("
    INSERT INTO user_settings (user_id, temp_min, temp_max, hum_min, hum_max, noise_max)
    VALUES (:uid, :temp_min, :temp_max, :hum_min, :hum_max, :noise_max)
    ON DUPLICATE KEY UPDATE
        temp_min  = VALUES(temp_min),
        temp_max  = VALUES(temp_max),
        hum_min   = VALUES(hum_min),
        hum_max   = VALUES(hum_max),
        noise_max = VALUES(noise_max)
");

$stmt->execute([
    ':uid'       => $_SESSION['user_id'],
    ':temp_min'  => $temp_min,
    ':temp_max'  => $temp_max,
    ':hum_min'   => $hum_min,
    ':hum_max'   => $hum_max,
    ':noise_max' => $noise_max,
]);

echo json_encode(['status' => 'success', 'message' => 'Einstellungen gespeichert.']);
