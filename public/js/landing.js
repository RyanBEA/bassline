(async function () {
  const container = document.getElementById('chart-bg');
  if (!container) return;

  let data;
  try {
    const res = await fetch('/api/chart-data');
    data = await res.json();
  } catch {
    return;
  }

  // Stacked area layers (bottom to top) + total as stroke outline
  const stackLayers = [
    { key: 'water',   color: '#FBBF24', opacity: 0.35 },
    { key: 'heating', color: '#E85D3A', opacity: 0.35 },
    { key: 'cooling', color: '#38BDF8', opacity: 0.4 }
  ];

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 1200 400');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.style.width = '100%';
  svg.style.height = '100%';

  // Render stacked area fills
  for (const layer of stackLayers) {
    const pathData = data[layer.key];
    if (!pathData) continue;

    const fill = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    fill.setAttribute('d', pathData);
    fill.setAttribute('fill', layer.color);
    fill.setAttribute('fill-opacity', layer.opacity);
    svg.appendChild(fill);
  }

  // Total load as stroke outline on top
  if (data.total) {
    const stroke = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    stroke.setAttribute('d', data.total);
    stroke.setAttribute('fill', 'none');
    stroke.setAttribute('stroke', '#f0eef2');
    stroke.setAttribute('stroke-width', '1');
    stroke.setAttribute('stroke-opacity', '0.25');
    svg.appendChild(stroke);
  }

  container.appendChild(svg);
})();
