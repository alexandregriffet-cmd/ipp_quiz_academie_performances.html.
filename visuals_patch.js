const ctx = document.createElement('canvas');
document.getElementById('radarChart').appendChild(ctx);

const data = {
  labels: ['Garant', 'Conquérant', 'Bienveillant', 'Visionnaire', 'Spontané', 'Fiable'],
  datasets: [{
    label: 'Profils IPP',
    data: [20, 15, 18, 22, 10, 15],
    backgroundColor: 'rgba(54, 162, 235, 0.2)',
    borderColor: 'rgba(54, 162, 235, 1)',
    pointBackgroundColor: [
      'blue', 'red', 'green', 'purple', 'orange', 'cyan'
    ],
    borderWidth: 2
  }]
};

new Chart(ctx, {
  type: 'radar',
  data: data,
  options: {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { r: { beginAtZero: true, max: 100 } }
  }
});

// Ajout d'une légende manuelle
const legendData = [
  { color: 'blue', label: 'Garant' },
  { color: 'red', label: 'Conquérant' },
  { color: 'green', label: 'Bienveillant' },
  { color: 'purple', label: 'Visionnaire' },
  { color: 'orange', label: 'Spontané' },
  { color: 'cyan', label: 'Fiable' }
];

const legendDiv = document.getElementById('legend');
legendData.forEach(item => {
  const entry = document.createElement('div');
  entry.classList.add('legend-item');
  entry.innerHTML = `<span class="color-box" style="background:${item.color}"></span>${item.label}`;
  legendDiv.appendChild(entry);
});
