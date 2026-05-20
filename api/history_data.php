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

// Letzte X Einträge holen (Standard: 60)
$limit = intval($_GET['limit'] ?? 60);
if ($limit < 1 || $limit > 500) $limit = 60;

$stmt = $pdo->prepare("
    SELECT temperatur, luftfeuchtigkeit, geraeusch_db, created_at
    FROM sensordaten
    ORDER BY created_at DESC
    LIMIT $limit
");
$stmt->execute();
$rows = array_reverse($stmt->fetchAll(PDO::FETCH_ASSOC));

$data = array_map(function($row) {
    return [
        'time'        => $row['created_at'],
        'temperature' => (float) $row['temperatur'],
        'humidity'    => (int)   $row['luftfeuchtigkeit'],
        'noise'       => (float) $row['geraeusch_db'],
    ];
}, $rows);

echo json_encode(['status' => 'success', 'data' => $data]);