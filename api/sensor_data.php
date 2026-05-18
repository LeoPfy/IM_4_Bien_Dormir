<?php
// api/sensor_data.php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Nicht eingeloggt']);
    exit;
}

require_once '../system/config.php';

$stmt = $pdo->prepare("
    SELECT temperatur, luftfeuchtigkeit, geraeusch_db
    FROM sensordaten
    ORDER BY id DESC
    LIMIT 1
");
$stmt->execute();
$row = $stmt->fetch(PDO::FETCH_ASSOC);

if ($row) {
    echo json_encode([
        'status'      => 'success',
        'temperature' => $row['temperatur'],
        'humidity'    => round($row['luftfeuchtigkeit']),
        'noise'       => $row['geraeusch_db'],
    ]);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Keine Daten vorhanden']);
}
