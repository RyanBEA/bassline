(async function () {
  const container = document.getElementById('chart-bg');
  if (!container) return;

  let data;
  try {
    const res = await fetch('/api/chart-data');
    data = await res.json();
  } catch {
    return; // Graceful degradation: no charts if data missing
  }

  // Chart layers: bottom to top (total is lowest layer, rendered first)
  const layers = [
    { key: 'total',   color: '#4F3D63', opacity: 0.2 },
    { key: 'heating', color: '#E85D3A', opacity: 0.15, stroke: true },
    { key: 'cooling', color: '#38BDF8', opacity: 0.15, stroke: true },
    { key: 'water',   color: '#FBBF24', opacity: 0.12, stroke: true }
  ];

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 1200 400');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.style.width = '100%';
  svg.style.height = '100%';

  for (const layer of layers) {
    const pathData = data[layer.key];
    if (!pathData) continue;

    // Area fill
    const fill = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    fill.setAttribute('d', pathData);
    fill.setAttribute('fill', layer.color);
    fill.setAttribute('fill-opacity', layer.opacity);
    svg.appendChild(fill);

    // Stroke on top (for non-total layers)
    if (layer.stroke) {
      // Extract just the line portion (before the closing L...Z)
      const lineEnd = pathData.lastIndexOf('L');
      const linePath = pathData.substring(0, lineEnd);

      const stroke = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      stroke.setAttribute('d', linePath);
      stroke.setAttribute('fill', 'none');
      stroke.setAttribute('stroke', layer.color);
      stroke.setAttribute('stroke-width', '1.5');
      stroke.setAttribute('stroke-opacity', '0.4');
      svg.appendChild(stroke);
    }
  }

  container.appendChild(svg);
})();
