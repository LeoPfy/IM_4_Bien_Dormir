<?php
// api/profil.php
// Liest Profildaten (id, email, firstname, lastname) des eingeloggten Users aus der users-Tabelle.
// Gibt JSON zurück mit vorname und nachname (gemappt von firstname/lastname).
// Wird von profil.js und monitor.js für die Willkommens-Anzeige verwendet.

session_start();

include_once "../system/config.php";

$userId = $_SESSION['user_id'];

$stmt = $pdo->prepare("SELECT * FROM users WHERE id = :user_id");
$stmt->execute([":user_id" => $userId]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

echo json_encode([
    "status" => "success",
    "user_id" => $user['id'],
    "email" => $user['email'],
    "vorname" => $user['firstname'],
    "nachname" => $user['lastname']
]);
