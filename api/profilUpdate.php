<?php
// api/profilUpdate.php
// Aktualisiert Vor- und Nachname des eingeloggten Users per HTTP POST (JSON: vorname, nachname).
// Schreibt die Änderungen in die users-Tabelle (firstname, lastname).
// Nur für eingeloggte User zugänglich (Session-Check).
session_start();
require_once '../system/config.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => "error", "message" => "Nicht angemeldet"]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["status" => "error", "message" => "Ungültige Anfrage"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$userID = $_SESSION['user_id'];
$vorname = trim($data['vorname'] ?? '');
$nachname = trim($data['nachname'] ?? '');

if (!$vorname || !$nachname) {
    echo json_encode(["status" => "error", "message" => "Bitte Vorname und Nachname ausfüllen."]);
    exit;
}

$stmt = $pdo->prepare("UPDATE users SET firstname = :vorname, lastname = :nachname WHERE id = :userID");

$success = $stmt->execute([
    ":vorname" => $vorname,
    ":nachname" => $nachname,
    ":userID" => $userID
]);

if ($success) {
    echo json_encode([
        "status" => "success",
        "message" => "Profil wurde gespeichert.",
        "vorname" => $vorname,
        "nachname" => $nachname
    ]);
} else {
    echo json_encode(["status" => "error", "message" => "Profil konnte nicht gespeichert werden."]);
}