<?php
// api/save_sensor_data.php
// Empfängt Sensordaten vom Arduino per HTTP POST (JSON).
// Validiert alle Pflichtfelder und schreibt die Daten per PDO in die sensordaten-Tabelle.
// Kein Session-Check nötig da der Aufrufer der Arduino ist, nicht ein Browser.

$conn = new mysqli($host, $user, $password, $dbname);

$input = json_decode(file_get_contents("php://input"));

$temperatur = $input->temperatur;
$luftfeuchtigkeit = $input->luftfeuchtigkeit;
$temperatur_status = $input->temperatur_status;
$luftfeuchtigkeit_status = $input->luftfeuchtigkeit_status;
$mikrofon_rohwert = $input->mikrofon_rohwert;
$geraeusch_db = $input->geraeusch_db;
$geraeusch_status = $input->geraeusch_status;

$stmt = $pdo->prepare("INSERT INTO sensordaten 
(temperatur, luftfeuchtigkeit, temperatur_status, luftfeuchtigkeit_status, mikrofon_rohwert, geraeusch_db, geraeusch_status)
VALUES (:temperatur, :luftfeuchtigkeit, :temperatur_status, :luftfeuchtigkeit_status, :mikrofon_rohwert, :geraeusch_db, :geraeusch_status)");
$stmt->execute([
    ':temperatur' => $temperatur,
    ':luftfeuchtigkeit' => $luftfeuchtigkeit,
    ':temperatur_status' => $temperatur_status,
    ':luftfeuchtigkeit_status' => $luftfeuchtigkeit_status,
    ':mikrofon_rohwert' => $mikrofon_rohwert,
    ':geraeusch_db' => $geraeusch_db,
    ':geraeusch_status' => $geraeusch_status
]);

echo "OK";
