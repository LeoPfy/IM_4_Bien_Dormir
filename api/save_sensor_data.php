<?php
// api/save_sensor_data.php
// Empfängt Sensordaten vom Arduino per HTTP POST (JSON).
// Validiert alle Pflichtfelder und schreibt die Daten per PDO in die sensordaten-Tabelle.
// Kein Session-Check nötig da der Aufrufer der Arduino ist, nicht ein Browser.

require_once '../system/config.php';

$input = json_decode(file_get_contents("php://input"));

$temperatur = $input->temperatur;
$luftfeuchtigkeit = $input->luftfeuchtigkeit;
$mikrofon_rohwert = $input->mikrofon_rohwert;
$geraeusch_db = $input->geraeusch_db;

$stmt = $pdo->prepare("INSERT INTO sensordaten (temperatur, luftfeuchtigkeit, mikrofon_rohwert, geraeusch_db) VALUES (:temperatur, :luftfeuchtigkeit, :mikrofon_rohwert, :geraeusch_db)");
$stmt->execute([
    ':temperatur' => $temperatur,
    ':luftfeuchtigkeit' => $luftfeuchtigkeit,
    ':mikrofon_rohwert' => $mikrofon_rohwert,
    ':geraeusch_db' => $geraeusch_db,
]);

echo "OK";
