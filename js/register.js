// register.js - updated

// ── Passwort-Stärke-Anzeige ──────────────────────────────

document.getElementById("password").addEventListener("input", function () {
  const v    = this.value;
  const fill = document.getElementById("strengthFill");
  const lbl  = document.getElementById("strengthLabel");

  let score = 0;
  if (v.length >= 8)          score++;
  if (/[A-Z]/.test(v))        score++;
  if (/[0-9]/.test(v))        score++;
  if (/[^A-Za-z0-9]/.test(v)) score++;

  const configs = [
    { w: "0%",   bg: "",          text: "" },
    { w: "25%",  bg: "#e07a5f",   text: "Schwach" },
    { w: "50%",  bg: "#f2a62a",   text: "Mittel" },
    { w: "75%",  bg: "#7aab8a",   text: "Gut" },
    { w: "100%", bg: "#4a7c59",   text: "Stark" },
  ];

  const c = configs[score] || configs[0];
  fill.style.width      = c.w;
  fill.style.background = c.bg;
  lbl.textContent       = c.text;
});

// ── Formular abschicken ──────────────────────────────────

document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const firstname = document.getElementById("firstname").value.trim();
  const lastname  = document.getElementById("lastname").value.trim();
  const email     = document.getElementById("email").value.trim();
  const password  = document.getElementById("password").value;
  const errBox    = document.getElementById("errorMsg");
  const okBox     = document.getElementById("successMsg");
  const btn       = document.getElementById("registerBtn");

  // Reset
  errBox.classList.remove("visible");
  okBox.classList.remove("visible");

  // Validierung
  if (!firstname || !lastname) {
    errBox.textContent = "Bitte Vor- und Nachname eingeben.";
    errBox.classList.add("visible");
    return;
  }
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
      body: JSON.stringify({ firstname, lastname, email, password }),
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
