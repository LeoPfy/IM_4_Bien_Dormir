<?php
// register.php
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
    $insert = $pdo->prepare("INSERT INTO users (firstname, lastname, email, password) 
                              VALUES (:firstname, :lastname, :email, :pass)");
    $insert->execute([
        ':firstname' => $firstname,
        ':lastname'  => $lastname,
        ':email'     => $email,
        ':pass'      => $hashedPassword,
    ]);

    echo json_encode(["status" => "success"]);

} else {
    echo json_encode(["status" => "error", "message" => "Invalid request method"]);
}
