<?php
// api/save_sensor.php
// Empfängt Sensordaten vom Arduino und speichert sie in der DB.

require_once '../system/config.php';

header('Content-Type: application/json');

// Nur POST erlauben
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Nur POST erlaubt']);
    exit;
}

// JSON einlesen
$input = json_decode(file_get_contents('php://input'));

if (!$input) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Ungültiges JSON']);
    exit;
}

// Pflichtfelder prüfen
$required = ['temperatur', 'luftfeuchtigkeit', 'temperatur_status',
             'luftfeuchtigkeit_status', 'mikrofon_rohwert', 'geraeusch_db', 'geraeusch_status'];

foreach ($required as $field) {
    if (!isset($input->$field)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => "Feld '$field' fehlt"]);
        exit;
    }
}

// In DB speichern (PDO — sicher gegen SQL Injection)
try {
    $stmt = $pdo->prepare("INSERT INTO sensordaten 
        (temperatur, luftfeuchtigkeit, temperatur_status, luftfeuchtigkeit_status,
         mikrofon_rohwert, geraeusch_db, geraeusch_status)
        VALUES (?, ?, ?, ?, ?, ?, ?)");

    $stmt->execute([
        $input->temperatur,
        $input->luftfeuchtigkeit,
        $input->temperatur_status,
        $input->luftfeuchtigkeit_status,
        $input->mikrofon_rohwert,
        $input->geraeusch_db,
        $input->geraeusch_status,
    ]);

    echo json_encode(['status' => 'success']);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Datenbankfehler: ' . $e->getMessage()]);
}
?>
