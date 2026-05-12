// login.js

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email    = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const errBox   = document.getElementById("errorMsg");
  const btn      = document.getElementById("loginBtn");

  // Reset
  errBox.classList.remove("visible");
  btn.disabled    = true;
  btn.textContent = "Wird geprüft…";

  try {
    const response = await fetch("api/login.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (result.status === "success") {
      btn.textContent = "✓ Angemeldet";
      window.location.href = "protected.html";
    } else {
      errBox.textContent = result.message || "Ungültige Anmeldedaten.";
      errBox.classList.add("visible");
      btn.disabled    = false;
      btn.textContent = "Anmelden";
    }
  } catch (error) {
    console.error("Fehler:", error);
    errBox.textContent = "Verbindungsfehler. Bitte nochmals versuchen.";
    errBox.classList.add("visible");
    btn.disabled    = false;
    btn.textContent = "Anmelden";
  }
});
