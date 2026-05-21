// monitor.js

// ── Benutzername laden ──────────────────────────────────────
async function loadUserName() {
  try {
    const res = await fetch("api/profil.php", {
      credentials: "include",
    });

    const data = await res.json();

    console.log("Name geladen:", data);

    const name = (data.vorname || "") + " " + (data.nachname || "");
    document.getElementById("userName").textContent = name.trim() || "—";
  } catch (err) {
    console.error("Name laden fehlgeschlagen:", err);
  }
}

loadUserName();

const POLL_INTERVAL = 5000;

// ── Grenzwerte (werden aus DB geladen) ──────────────────────
let LIMITS = {
  temp:     { min: 18,  max: 22,  absMin: 10,  absMax: 35  },
  humidity: { min: 40,  max: 60,  absMin: 10,  absMax: 100 },
  noise:    { min: 0,   max: 40,  absMin: 0,   absMax: 100 },
};

async function loadLimits() {
  try {
    const res  = await fetch('api/settings_load.php', { credentials: 'include' });
    const data = await res.json();
    if (data.status === 'success') {
      LIMITS.temp.min     = data.temp_min;
      LIMITS.temp.max     = data.temp_max;
      LIMITS.humidity.min = data.hum_min;
      LIMITS.humidity.max = data.hum_max;
      LIMITS.noise.max    = data.noise_max;
    }
  } catch (err) {
    console.error('Grenzwerte laden fehlgeschlagen:', err);
  }
}

// ── Daten vom Backend holen ──────────────────────────────────
async function fetchSensorData() {
  const res = await fetch('api/sensor_data.php', { credentials: 'include' });
  return await res.json();
}

// ── Status berechnen ─────────────────────────────────────────
function getStatus(value, limits) {
  const v = parseFloat(value);
  if (v >= limits.min && v <= limits.max) return 'ok';
  const margin = (limits.max - limits.min) * 0.2;
  if (v >= limits.min - margin && v <= limits.max + margin) return 'warn';
  return 'alert';
}

// ── Empfehlung generieren ────────────────────────────────────
function getRecommendation(data, tempStatus, humidityStatus, noiseStatus) {
  const issues = [];

  if (tempStatus === 'alert') {
    issues.push({
      icon: '🌡️',
      label: 'Temperatur',
      text: parseFloat(data.temperature) > 22
        ? 'Zu hoch — Lüfte das Zimmer oder senke die Heizung.'
        : 'Zu niedrig — Heize das Zimmer etwas auf.'
    });
  } else if (tempStatus === 'warn') {
    issues.push({
      icon: '🌡️',
      label: 'Temperatur',
      text: parseFloat(data.temperature) > 22
        ? 'Leicht erhöht.'
        : 'Leicht zu kühl.'
    });
  }

  if (humidityStatus === 'alert') {
    issues.push({
      icon: '💧',
      label: 'Luftfeuchtigkeit',
      text: parseFloat(data.humidity) > 60
        ? 'Zu feucht — Ein Luftentfeuchter kann helfen.'
        : 'Zu trocken — Ein Luftbefeuchter wäre empfehlenswert.'
    });
  } else if (humidityStatus === 'warn') {
    issues.push({
      icon: '💧',
      label: 'Luftfeuchtigkeit',
      text: parseFloat(data.humidity) > 60
        ? 'Leicht erhöht.'
        : 'Leicht zu niedrig.'
    });
  }

  if (noiseStatus === 'alert') {
    issues.push({
      icon: '🔊',
      label: 'Geräusch',
      text: 'Zu laut — Versuche Lärmquellen zu reduzieren.'
    });
  } else if (noiseStatus === 'warn') {
    issues.push({
      icon: '🔊',
      label: 'Geräusch',
      text: 'Leicht erhöht.'
    });
  }

  if (issues.length === 0) {
    return { html: '<span>Alle Werte sind im optimalen Bereich. Das Raumklima ist ideal! ✓</span>', level: 'ok' };
  }

  const html = issues.map(i =>
    `<div class="rec-item"><span class="rec-item-icon">${i.icon}</span><span><strong>${i.label}:</strong> ${i.text}</span></div>`
  ).join('');

  const level = issues.some(i => ['alert'].includes(
    i.label === 'Temperatur' ? tempStatus :
    i.label === 'Luftfeuchtigkeit' ? humidityStatus : noiseStatus
  )) ? 'alert' : 'warn';

  return { html, level };
}

// ── UI aktualisieren ─────────────────────────────────────────
function updateUI(data) {
  const tempStatus     = getStatus(data.temperature, LIMITS.temp);
  const humidityStatus = getStatus(data.humidity,    LIMITS.humidity);
  const noiseStatus    = getStatus(data.noise,       LIMITS.noise);

  // Karten
  const cards = [
    { id: 'temp',     value: data.temperature, status: tempStatus },
    { id: 'humidity', value: data.humidity,    status: humidityStatus },
    { id: 'noise',    value: data.noise,       status: noiseStatus },
  ];

  cards.forEach(({ id, value, status }) => {
    document.getElementById('card-' + id).className = 'sensor-card status-' + status;
    // Temperatur mit 1 Dezimalstelle, Luftfeuchtigkeit und Lautstärke als ganze Zahlen
    const display = id === 'temp'
      ? parseFloat(value).toFixed(1)
      : Math.round(parseFloat(value));
    document.getElementById(id + 'Value').textContent = display;
  });

  // Empfehlung
  const rec = getRecommendation(data, tempStatus, humidityStatus, noiseStatus);
  const recCard = document.getElementById('recommendationCard');
  recCard.className = 'recommendation-card ' + (rec.level !== 'ok' ? rec.level : '');
  document.getElementById('recommendationText').innerHTML = rec.html;

  // Uhrzeit
  const now = new Date();
  document.getElementById('pageTime').textContent =
    now.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' });
}

// ── Uhrzeit jede Minute aktualisieren ───────────────────────
function updateClock() {
  const now = new Date();
  document.getElementById('pageTime').textContent =
    now.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' });
}
setInterval(updateClock, 60000);

// ── Polling ──────────────────────────────────────────────────
async function poll() {
  try {
    const data = await fetchSensorData();
    updateUI(data);
  } catch (err) {
    console.error('Sensordaten konnten nicht geladen werden:', err);
  }
}

// Erst Grenzwerte laden, dann starten
loadLimits().then(() => {
  poll();
  setInterval(poll, POLL_INTERVAL);
});