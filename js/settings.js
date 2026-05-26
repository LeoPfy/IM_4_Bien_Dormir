// settings.js
// Lädt beim Start die gespeicherten Grenzwerte des Users (api/settings_load.php) und füllt
// das Formular vor. Beim Speichern werden die Werte per POST an api/settings_save.php gesendet
// und in der users-Tabelle der Datenbank gespeichert.

async function loadSettings() {
  try {
    const res  = await fetch('api/settings_load.php', { credentials: 'include' });
    const data = await res.json();

    if (data.status === 'success') {
      document.getElementById('temp_min').value  = data.temp_min;
      document.getElementById('temp_max').value  = data.temp_max;
      document.getElementById('hum_min').value   = data.hum_min;
      document.getElementById('hum_max').value   = data.hum_max;
      document.getElementById('noise_max').value = data.noise_max;
    }
  } catch (err) {
    console.error('Settings laden fehlgeschlagen:', err);
  }
}

document.getElementById('settingsForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const successMsg = document.getElementById('settingsSuccess');
  const errorMsg   = document.getElementById('settingsError');
  const btn        = document.getElementById('saveSettingsBtn');

  successMsg.classList.remove('visible');
  errorMsg.classList.remove('visible');
  btn.disabled    = true;
  btn.textContent = 'Wird gespeichert…';

  const payload = {
    temp_min:  parseFloat(document.getElementById('temp_min').value),
    temp_max:  parseFloat(document.getElementById('temp_max').value),
    hum_min:   parseInt(document.getElementById('hum_min').value),
    hum_max:   parseInt(document.getElementById('hum_max').value),
    noise_max: parseInt(document.getElementById('noise_max').value),
  };

  try {
    const res  = await fetch('api/settings_save.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (data.status === 'success') {
      successMsg.textContent = '✓ Einstellungen gespeichert.';
      successMsg.classList.add('visible');
    } else {
      errorMsg.textContent = data.message || 'Fehler beim Speichern.';
      errorMsg.classList.add('visible');
    }
  } catch (err) {
    errorMsg.textContent = 'Verbindungsfehler. Bitte nochmals versuchen.';
    errorMsg.classList.add('visible');
  }

  btn.disabled    = false;
  btn.textContent = 'Einstellungen speichern';
});

loadSettings();
