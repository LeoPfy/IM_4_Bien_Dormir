<?php
// api/register.php
// Verarbeitet Registrierungsanfragen per HTTP POST (JSON: firstname, lastname, email, password).
// Prüft ob Email bereits existiert, hasht das Passwort mit bcrypt und schreibt den neuen
// User in die users-Tabelle. Gibt JSON { status: "success" } oder Fehlermeldung zurück.

session_start();
header('Content-Type: application/json');

require_once '../system/config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $data = json_decode(file_get_contents("php://input"), true);

    $firstname = trim($data['firstname'] ?? '');
    $lastname  = trim($data['lastname']  ?? '');
    $email     = trim($data['email']     ?? '');
    $password  = trim($data['password']  ?? '');

    if (!$firstname || !$lastname || !$email || !$password) {
        echo json_encode(["status" => "error", "message" => "Alle Felder sind erforderlich"]);
        exit;
    }

    // Prüfen ob Email bereits existiert
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = :email");
    $stmt->execute([':email' => $email]);
    if ($stmt->fetch()) {
        echo json_encode(["status" => "error", "message" => "Diese E-Mail wird bereits verwendet"]);
        exit;
    }

    // Passwort hashen
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // User einfügen
    try {
        $insert = $pdo->prepare("INSERT INTO users (email, password, firstname, lastname) 
                                  VALUES (:email, :pass, :firstname, :lastname)");
        $success = $insert->execute([
            ':email'     => $email,
            ':pass'      => $hashedPassword,
            ':firstname' => $firstname,
            ':lastname'  => $lastname,
        ]);

        if ($success) {
            echo json_encode(["status" => "success"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Registrierung fehlgeschlagen."]);
        }
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => "DB Fehler: " . $e->getMessage()]);
    }

} else {
    echo json_encode(["status" => "error", "message" => "Invalid request method"]);
}