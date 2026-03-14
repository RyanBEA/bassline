const fs = require('node:fs');
const path = require('node:path');

const VIEW_W = 1200;
const VIEW_H = 400;
const PADDING_TOP = 0.1;  // 10% padding at top
const PADDING_BOT = 0.15; // 15% padding at bottom (area fades into bg)

/**
 * Parse CSV text into normalized {x, y} points fitting a viewBox.
 * Y-axis is inverted (SVG convention: 0 is top).
 */
function csvToPoints(csvText, width, height) {
  const lines = csvText.trim().split('\n').slice(1); // skip header
  const raw = lines
    .map(line => {
      const parts = line.split(',');
      // Handle both date formats (with and without time)
      const date = new Date(parts[0].trim());
      const kwh = parseFloat(parts[1].trim());
      return { date, kwh };
    })
    .filter(d => !isNaN(d.kwh) && !isNaN(d.date.getTime()))
    .sort((a, b) => a.date - b.date);

  if (raw.length === 0) return [];

  const minKwh = Math.min(...raw.map(d => d.kwh));
  const maxKwh = Math.max(...raw.map(d => d.kwh));
  const range = maxKwh - minKwh || 1;

  const usableTop = height * PADDING_TOP;
  const usableBottom = height * (1 - PADDING_BOT);
  const usableHeight = usableBottom - usableTop;

  return raw.map((d, i) => ({
    x: raw.length === 1 ? 0 : Math.round((i / (raw.length - 1)) * width),
    y: Math.round(usableBottom - ((d.kwh - minKwh) / range) * usableHeight)
  }));
}

/**
 * Convert points to a closed SVG area path with smooth cubic bezier curves.
 * The area is bounded by the curve on top and the bottom of the viewBox.
 */
function pointsToAreaPath(points, height) {
  if (points.length === 0) return '';
  if (points.length === 1) {
    return `M${points[0].x},${points[0].y}L${points[0].x},${height}L0,${height}Z`;
  }

  // Start at first point
  let d = `M${points[0].x},${points[0].y}`;

  // Cubic bezier through remaining points (monotone-x interpolation)
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cp = (curr.x - prev.x) / 3; // control point offset (1/3 segment width)
    d += `C${prev.x + cp},${prev.y},${curr.x - cp},${curr.y},${curr.x},${curr.y}`;
  }

  // Close area: line down to bottom-right, across to bottom-left, close
  const lastX = points[points.length - 1].x;
  d += `L${lastX},${height}L0,${height}Z`;

  return d;
}

// --- Build script (only runs when executed directly) ---

const DATASETS = [
  { file: 'energy-daily-kwh.csv', key: 'total' },
  { file: 'energy-daily-heatpump-heating.csv', key: 'heating' },
  { file: 'energy-daily-heatpump-cooling.csv', key: 'cooling' },
  { file: 'energy-daily-waterheater.csv', key: 'water' }
];

function build() {
  const result = {};
  for (const ds of DATASETS) {
    const csvPath = path.join(__dirname, ds.file);
    const csv = fs.readFileSync(csvPath, 'utf-8');
    const points = csvToPoints(csv, VIEW_W, VIEW_H);
    result[ds.key] = pointsToAreaPath(points, VIEW_H);
  }

  const outDir = path.join(__dirname, 'data');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
  fs.writeFileSync(path.join(outDir, 'svg-paths.json'), JSON.stringify(result, null, 2));
  console.log('Built SVG paths →', path.join(outDir, 'svg-paths.json'));
}

if (require.main === module) {
  build();
}

module.exports = { csvToPoints, pointsToAreaPath };
