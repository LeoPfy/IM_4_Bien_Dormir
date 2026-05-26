// profil.js
// Lädt beim Start den Vor- und Nachnamen des eingeloggten Users (api/profil.php).
// Beim Speichern werden die Änderungen per POST an api/profilUpdate.php gesendet
// und in der users-Tabelle der Datenbank aktualisiert.

async function loadProfile() {
  try {
    const response = await fetch("api/profil.php", {
      credentials: "include",
    });

    const result = await response.json();

    console.log("Profil geladen:", result);

    document.getElementById("vorname").value = result.vorname || "";
    document.getElementById("nachname").value = result.nachname || "";
  } catch (error) {
    console.error("Profil konnte nicht geladen werden:", error);
  }
}

loadProfile();

document.getElementById("profilForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const vorname = document.getElementById("vorname").value.trim();
  const nachname = document.getElementById("nachname").value.trim();

  const successMsg = document.getElementById("successMsg");
  const errorMsg = document.getElementById("errorMsg");
  const btn = document.getElementById("saveProfileBtn");

  successMsg.classList.remove("visible");
  errorMsg.classList.remove("visible");

  btn.disabled = true;
  btn.textContent = "Wird gespeichert…";

  try {
    const response = await fetch("api/profilUpdate.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ vorname, nachname }),
    });

    const result = await response.json();

    console.log("Profil gespeichert:", result);

    if (result.status === "success") {
      successMsg.textContent = "Profil wurde gespeichert.";
      successMsg.classList.add("visible");
    } else {
      errorMsg.textContent = result.message || "Profil konnte nicht gespeichert werden.";
      errorMsg.classList.add("visible");
    }
  } catch (error) {
    console.error("Fehler:", error);
    errorMsg.textContent = "Verbindungsfehler. Bitte nochmals versuchen.";
    errorMsg.classList.add("visible");
  }

  btn.disabled = false;
  btn.textContent = "Profil speichern";
});