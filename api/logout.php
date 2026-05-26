<?php
// api/logout.php
// Beendet die aktuelle PHP-Session vollständig ($_SESSION leeren + session_destroy()).
// Wird von js/logout.js per GET aufgerufen.
// Gibt JSON { status: "success" } zurück, die Weiterleitung zu login.html
// übernimmt logout.js im Browser.

session_start();
$_SESSION = [];
session_destroy();

// Return a success response instead of redirecting
header('Content-Type: application/json');
echo json_encode(["status" => "success"]);
exit;
?>