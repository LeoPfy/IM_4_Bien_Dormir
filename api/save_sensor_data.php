<?php
$host = "orusovez.mysql.db.internal";
$dbname = "orusovez_biendormir";
$user = "orusovez_biendo";
$password = "davidesMaxiEier?";

$conn = new mysqli($host, $user, $password, $dbname);

if ($conn->connect_error) {
    die("Verbindung fehlgeschlagen: " . $conn->connect_error);
}

$input = json_decode(file_get_contents("php://input"));

$temperatur = $input->temperatur;
$luftfeuchtigkeit = $input->luftfeuchtigkeit;
$temperatur_status = $input->temperatur_status;
$luftfeuchtigkeit_status = $input->luftfeuchtigkeit_status;
$mikrofon_rohwert = $input->mikrofon_rohwert;
$geraeusch_db = $input->geraeusch_db;
$geraeusch_status = $input->geraeusch_status;

$stmt = $conn->prepare("INSERT INTO sensordaten 
(temperatur, luftfeuchtigkeit, temperatur_status, luftfeuchtigkeit_status, mikrofon_rohwert, geraeusch_db, geraeusch_status)
VALUES (?, ?, ?, ?, ?, ?, ?)");

$stmt->bind_param("ddssids", $temperatur, $luftfeuchtigkeit, $temperatur_status, $luftfeuchtigkeit_status, $mikrofon_rohwert, $geraeusch_db, $geraeusch_status);

if ($stmt->execute()) {
    echo "OK";
} else {
    echo "Fehler: " . $stmt->error;
}

$stmt->close();
$conn->close();
?>