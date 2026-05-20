// history.js

// ── Grenzwerte ───────────────────────────────────────────────
const LIMITS = {
  temperature: { min: 18, max: 22 },
  humidity:    { min: 40, max: 60 },
  noise:       { min: 0,  max: 40 },
};

const COLOR_OK    = 'rgba(74, 124, 89, 0.9)';   // Salbeigrün
const COLOR_ALERT = 'rgba(224, 122, 95, 0.9)';   // Terracotta
const COLOR_OK_BG    = 'rgba(74, 124, 89, 0.08)';
const COLOR_ALERT_BG = 'rgba(224, 122, 95, 0.08)';

// ── Segmentfarbe je Wert berechnen ───────────────────────────
// Chart.js v3+ unterstützt segment-Farben direkt
function segmentColor(ctx, key) {
  const value = ctx.p1.parsed.y;
  const limit = LIMITS[key];
  return value >= limit.min && value <= limit.max ? COLOR_OK : COLOR_ALERT;
}

function segmentBgColor(ctx, key) {
  const value = ctx.p1.parsed.y;
  const limit = LIMITS[key];
  return value >= limit.min && value <= limit.max ? COLOR_OK_BG : COLOR_ALERT_BG;
}

// ── Chart erstellen ──────────────────────────────────────────
function createChart(canvasId, labels, values, key, unit) {
  const ctx = document.getElementById(canvasId).getContext('2d');

  return new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data: values,
        segment: {
          borderColor: ctx => segmentColor(ctx, key),
          backgroundColor: ctx => segmentBgColor(ctx, key),
        },
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: ctx => {
          const v = ctx.parsed?.y;
          const l = LIMITS[key];
          return v >= l.min && v <= l.max ? COLOR_OK : COLOR_ALERT;
        },
        fill: true,
        tension: 0.3,
      }]
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.parsed.y} ${unit}`,
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(0,0,0,0.04)' },
          ticks: {
            font: { family: 'DM Sans', size: 11 },
            color: '#7a8a7b',
            maxTicksLimit: 6,
            maxRotation: 0,
          }
        },
        y: {
          grid: { color: 'rgba(0,0,0,0.04)' },
          ticks: {
            font: { family: 'DM Sans', size: 11 },
            color: '#7a8a7b',
          }
        }
      }
    }
  });
}

// ── Daten laden und Charts rendern ───────────────────────────
async function loadHistory() {
  try {
    const res  = await fetch('api/history_data.php?hours=6', { credentials: 'include' });
    const json = await res.json();

    if (json.status !== 'success' || !json.data.length) {
      document.querySelector('.charts-container').innerHTML =
        '<p class="no-data">Noch keine Verlaufsdaten vorhanden.</p>';
      return;
    }

    const data   = json.data;
    const labels = data.map(d => {
      const t = new Date(d.time);
      return t.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' });
    });

    createChart('chart-temp',     labels, data.map(d => d.temperature), 'temperature', '°C');
    createChart('chart-humidity', labels, data.map(d => d.humidity),    'humidity',    '%');
    createChart('chart-noise',    labels, data.map(d => d.noise),       'noise',       'dB');

  } catch (err) {
    console.error('Verlauf konnte nicht geladen werden:', err);
  }
}

// ── Filter Buttons ───────────────────────────────────────────
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    document.querySelectorAll('.chart-card').forEach(card => {
      if (filter === 'all') {
        card.style.display = 'block';
      } else {
        card.style.display = card.id === 'section-' + filter ? 'block' : 'none';
      }
    });
  });
});

loadHistory();
