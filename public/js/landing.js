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
    { key: 'water',   color: '#FBBF24', fillOpacity: 0.2, strokeOpacity: 0.6 },
    { key: 'heating', color: '#E85D3A', fillOpacity: 0.2, strokeOpacity: 0.6 },
    { key: 'cooling', color: '#38BDF8', fillOpacity: 0.25, strokeOpacity: 0.7 }
  ];

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 1200 400');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.style.width = '100%';
  svg.style.height = '100%';

  // Render stacked areas with translucent fill + solid stroke on top edge
  for (const layer of stackLayers) {
    const areaPath = data[layer.key];
    const strokePathData = data[layer.key + 'Stroke'];
    if (!areaPath) continue;

    // Translucent area fill
    const fill = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    fill.setAttribute('d', areaPath);
    fill.setAttribute('fill', layer.color);
    fill.setAttribute('fill-opacity', layer.fillOpacity);
    svg.appendChild(fill);

    // Solid stroke on top edge
    if (strokePathData) {
      const stroke = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      stroke.setAttribute('d', strokePathData);
      stroke.setAttribute('fill', 'none');
      stroke.setAttribute('stroke', layer.color);
      stroke.setAttribute('stroke-width', '1.5');
      stroke.setAttribute('stroke-opacity', layer.strokeOpacity);
      svg.appendChild(stroke);
    }
  }

  // Total load as stroke outline on top
  if (data.total) {
    const stroke = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    stroke.setAttribute('d', data.total);
    stroke.setAttribute('fill', 'none');
    stroke.setAttribute('stroke', '#f0eef2');
    stroke.setAttribute('stroke-width', '1');
    stroke.setAttribute('stroke-opacity', '0.3');
    svg.appendChild(stroke);
  }

  container.appendChild(svg);
})();
