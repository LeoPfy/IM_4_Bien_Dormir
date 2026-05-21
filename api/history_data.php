<?php
// api/history_data.php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Nicht eingeloggt']);
    exit;
}

require_once '../system/config.php';

// Stunden zurück (Standard: 6)
$hours = intval($_GET['hours'] ?? 6);
if ($hours < 1 || $hours > 24) $hours = 6;

// Jeden 10. Eintrag holen (bei ~4s Intervall = ca. alle 40s ein Punkt)
// Das ergibt ~54 Punkte pro Stunde, überschaubar für den Chart
$stmt = $pdo->prepare("
    SELECT temperatur, luftfeuchtigkeit, geraeusch_db, erstellt_am
    FROM sensordaten
    WHERE erstellt_am >= NOW() - INTERVAL $hours HOUR
    AND MOD(id, 10) = 0
    ORDER BY erstellt_am ASC
");
$stmt->execute();
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

$data = array_map(function($row) {
    return [
        'time'        => $row['erstellt_am'],
        'temperature' => (float) $row['temperatur'],
        'humidity'    => (int)   $row['luftfeuchtigkeit'],
        'noise'       => (float) $row['geraeusch_db'],
    ];
}, $rows);

echo json_encode(['status' => 'success', 'data' => $data]);