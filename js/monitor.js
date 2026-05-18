// monitor.js

// ── Benutzername laden ──────────────────────────────────────
async function loadUserName() {
  try {
<<<<<<< HEAD
    const res  = await fetch('api/profil.php', { credentials: 'include' });
    if (res.status === 401) {
      window.location.href = 'login.html';
      return;
    }
    const data = await res.json();
    const name = (data.vorname || '') + ' ' + (data.nachname || '');
    document.getElementById('userName').textContent = name.trim();
  } catch (err) {
    console.error('Name laden fehlgeschlagen:', err);
=======
    const res = await fetch("api/profil.php", {
      credentials: "include",
    });

    const data = await res.json();

    console.log("Name geladen:", data);

    const name = (data.vorname || "") + " " + (data.nachname || "");
    document.getElementById("userName").textContent = name.trim() || "—";
  } catch (err) {
    console.error("Name laden fehlgeschlagen:", err);
>>>>>>> a7654bd95ce0e1bf28e33266d3755510f24c55d2
  }
}

loadUserName();

const POLL_INTERVAL = 5000;

// ── Grenzwerte ───────────────────────────────────────────────
const LIMITS = {
  temp:     { min: 18,  max: 22,  absMin: 10,  absMax: 35  },
  humidity: { min: 40,  max: 60,  absMin: 10,  absMax: 100 },
  noise:    { min: 0,   max: 40,  absMin: 0,   absMax: 100 },
};

// ── Platzhalter-Daten ────────────────────────────────────────
// TODO: Entfernen sobald api/sensor_data.php echte Daten liefert
function getMockData() {
  return {
    temperature: (19 + Math.random() * 4).toFixed(1),
    humidity:    (45 + Math.random() * 20).toFixed(0),
    noise:       (28 + Math.random() * 20).toFixed(0),
  };
}

// ── Daten vom Backend holen ──────────────────────────────────
async function fetchSensorData() {
  // TODO: Diese zwei Zeilen einkommentieren sobald Arduino-Backend bereit:
  // const res  = await fetch('api/sensor_data.php');
  // return await res.json();
  return getMockData();
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
    issues.push(parseFloat(data.temperature) > 22
      ? 'Die Temperatur ist zu hoch. Lüfte das Zimmer oder senke die Heizung.'
      : 'Die Temperatur ist zu niedrig. Heize das Zimmer etwas auf.');
  } else if (tempStatus === 'warn') {
    issues.push(parseFloat(data.temperature) > 22
      ? 'Die Temperatur ist leicht erhöht.'
      : 'Die Temperatur ist leicht zu kühl.');
  }

  if (humidityStatus === 'alert') {
    issues.push(parseFloat(data.humidity) > 60
      ? 'Die Luft ist zu feucht. Ein Luftentfeuchter kann helfen.'
      : 'Die Luft ist zu trocken. Ein Luftbefeuchter wäre empfehlenswert.');
  } else if (humidityStatus === 'warn') {
    issues.push(parseFloat(data.humidity) > 60
      ? 'Die Luftfeuchtigkeit ist leicht erhöht.'
      : 'Die Luftfeuchtigkeit ist leicht zu niedrig.');
  }

  if (noiseStatus === 'alert') {
    issues.push('Der Geräuschpegel ist zu laut. Versuche Lärmquellen zu reduzieren.');
  } else if (noiseStatus === 'warn') {
    issues.push('Der Geräuschpegel ist leicht erhöht.');
  }

  if (issues.length === 0) {
    return { text: 'Alle Werte sind im optimalen Bereich. Das Raumklima ist ideal!', level: 'ok' };
  }
  return { text: issues.join(' '), level: noiseStatus === 'alert' || tempStatus === 'alert' || humidityStatus === 'alert' ? 'alert' : 'warn' };
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
    document.getElementById(id + 'Value').textContent = value;
  });

  // Empfehlung
  const rec = getRecommendation(data, tempStatus, humidityStatus, noiseStatus);
  const recCard = document.getElementById('recommendationCard');
  recCard.className = 'recommendation-card ' + (rec.level !== 'ok' ? rec.level : '');
  document.getElementById('recommendationText').textContent = rec.text;

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

poll();
setInterval(poll, POLL_INTERVAL);