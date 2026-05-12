// register.js

// ── Formular abschicken ──────────────────────────────────

document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email    = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const errBox   = document.getElementById("errorMsg");
  const okBox    = document.getElementById("successMsg");
  const btn      = document.getElementById("registerBtn");

  // Reset
  errBox.classList.remove("visible");
  okBox.classList.remove("visible");

  // Client-seitige Validierung
  if (password.length < 8) {
    errBox.textContent = "Das Passwort muss mindestens 8 Zeichen haben.";
    errBox.classList.add("visible");
    return;
  }

  btn.disabled    = true;
  btn.textContent = "Wird erstellt…";

  try {
    const response = await fetch("api/register.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (result.status === "success") {
      okBox.textContent = "Konto erstellt! Du wirst zum Login weitergeleitet…";
      okBox.classList.add("visible");
      btn.textContent = "✓ Erstellt";
      setTimeout(() => (window.location.href = "login.html"), 1800);
    } else {
      errBox.textContent = result.message || "Registrierung fehlgeschlagen.";
      errBox.classList.add("visible");
      btn.disabled    = false;
      btn.textContent = "Konto erstellen";
    }
  } catch (error) {
    console.error("Fehler:", error);
    errBox.textContent = "Verbindungsfehler. Bitte nochmals versuchen.";
    errBox.classList.add("visible");
    btn.disabled    = false;
    btn.textContent = "Konto erstellen";
  }
});
