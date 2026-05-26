<?php
// api/history_data.php
// Gibt die letzten 200 Einträge aus der sensordaten-Tabelle als JSON-Array zurück.
// Sortiert chronologisch (ältester zuerst) für die Chart-Darstellung.
// Nur für eingeloggte User zugänglich (Session-Check). Wird von history.js aufgerufen.

session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Nicht eingeloggt']);
    exit;
}

require_once '../system/config.php';

// Letzte 200 Einträge holen, egal wann
$stmt = $pdo->prepare("
    SELECT temperatur, luftfeuchtigkeit, geraeusch_db, erstellt_am
    FROM sensordaten
    ORDER BY erstellt_am DESC
    LIMIT 200
");
$stmt->execute();
$rows = array_reverse($stmt->fetchAll(PDO::FETCH_ASSOC));

$data = array_map(function($row) {
    return [
        'time'        => $row['erstellt_am'],
        'temperature' => (float) $row['temperatur'],
        'humidity'    => (int)   $row['luftfeuchtigkeit'],
        'noise'       => (float) $row['geraeusch_db'],
    ];
}, $rows);

echo json_encode(['status' => 'success', 'data' => $data]);