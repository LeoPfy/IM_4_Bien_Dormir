<?php
// api/settings_load.php
// Liest die persönlichen Grenzwerte des eingeloggten Users direkt aus der users-Tabelle.
// Gibt JSON zurück mit temp_min, temp_max, hum_min, hum_max, noise_max.
// Falls keine Werte gesetzt: Standardwerte (18/22°C, 40/60%, 40dB).

session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Nicht eingeloggt']);
    exit;
}

require_once '../system/config.php';

$stmt = $pdo->prepare("SELECT temp_min, temp_max, hum_min, hum_max, noise_max FROM users WHERE id = :uid");
$stmt->execute([':uid' => $_SESSION['user_id']]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);

echo json_encode([
    'status'    => 'success',
    'temp_min'  => (float) ($row['temp_min']  ?? 18.0),
    'temp_max'  => (float) ($row['temp_max']  ?? 22.0),
    'hum_min'   => (int)   ($row['hum_min']   ?? 40),
    'hum_max'   => (int)   ($row['hum_max']   ?? 60),
    'noise_max' => (int)   ($row['noise_max'] ?? 40),
]);