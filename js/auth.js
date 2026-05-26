// auth.js
// Prüft beim Laden der Seite ob der User eingeloggt ist (api/protected.php).
// Bei fehlendem Login (401): Weiterleitung zu login.html.
// Wird auf profil.html eingebunden als zusätzlicher Auth-Schutz.

async function checkAuth() {
  try {
    const response = await fetch("/api/protected.php", {
      credentials: "include",
    });

    if (response.status === 401) {
      window.location.href = "/login.html";
      return false;
    }

    const result = await response.json();

    return true;
  } catch (error) {
    console.error("Auth check failed:", error);
    window.location.href = "/login.html";
    return false;
  }
}

// Check auth when page loads
window.addEventListener("load", checkAuth);
