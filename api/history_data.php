<?php
// api/history_data.php
// Gibt die Sensordaten der letzten X Stunden zurück
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Nicht eingeloggt']);
    exit;
}

require_once '../system/config.php';

// Stunden als Parameter, Standard 6
$hours = intval($_GET['hours'] ?? 6);
if ($hours < 1 || $hours > 24) $hours = 6;

$stmt = $pdo->prepare("
    SELECT temperatur, luftfeuchtigkeit, geraeusch_db, created_at
    FROM sensordaten
    WHERE created_at >= NOW() - INTERVAL :hours HOUR
    ORDER BY created_at ASC
");
$stmt->execute([':hours' => $hours]);
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

$data = array_map(function($row) {
    return [
        'time'        => $row['created_at'],
        'temperature' => (float) $row['temperatur'],
        'humidity'    => (int)   $row['luftfeuchtigkeit'],
        'noise'       => (float) $row['geraeusch_db'],
    ];
}, $rows);

echo json_encode(['status' => 'success', 'data' => $data]);
