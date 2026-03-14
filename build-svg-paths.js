const fs = require('node:fs');
const path = require('node:path');

const VIEW_W = 1200;
const VIEW_H = 400;
const PADDING_TOP = 0.05; // small top padding so peaks don't clip

/**
 * Parse CSV text into {date, kwh} records, sorted by date.
 */
function parseCsv(csvText) {
  const lines = csvText.trim().split('\n').slice(1);
  return lines
    .map(line => {
      const parts = line.split(',');
      const date = new Date(parts[0].trim());
      const kwh = parseFloat(parts[1].trim());
      return { date, kwh };
    })
    .filter(d => !isNaN(d.kwh) && !isNaN(d.date.getTime()))
    .sort((a, b) => a.date - b.date);
}

const ONE_DAY = 24 * 60 * 60 * 1000;

/**
 * Fill a complete daily series from globalMinDate to globalMaxDate.
 * - Outside the dataset's own range (before first / after last): fills with 0.
 * - Inside the dataset's range: interpolates between known points to bridge gaps.
 */
function fillZeros(records, globalMinDate, globalMaxDate) {
  const lookup = new Map();
  for (const r of records) {
    lookup.set(r.date.toISOString().slice(0, 10), r.kwh);
  }

  const firstDataDate = records.length > 0 ? records[0].date : null;
  const lastDataDate = records.length > 0 ? records[records.length - 1].date : null;

  // Build sorted array of known data points for interpolation
  const knownDates = records.map(r => r.date.getTime());
  const knownValues = records.map(r => r.kwh);

  function interpolate(dateMs) {
    // Find surrounding known points and linearly interpolate
    let lo = 0, hi = knownDates.length - 1;
    while (lo < hi - 1) {
      const mid = (lo + hi) >> 1;
      if (knownDates[mid] <= dateMs) lo = mid; else hi = mid;
    }
    if (knownDates[hi] <= dateMs) return knownValues[hi];
    if (knownDates[lo] >= dateMs) return knownValues[lo];
    const t = (dateMs - knownDates[lo]) / (knownDates[hi] - knownDates[lo]);
    return knownValues[lo] + t * (knownValues[hi] - knownValues[lo]);
  }

  const filled = [];
  const current = new Date(globalMinDate);
  while (current <= globalMaxDate) {
    const key = current.toISOString().slice(0, 10);
    const known = lookup.get(key);
    let kwh;
    if (known !== undefined) {
      kwh = known;
    } else if (firstDataDate && current >= firstDataDate && current <= lastDataDate) {
      kwh = interpolate(current.getTime());
    } else {
      kwh = 0;
    }
    filled.push({ date: new Date(current), kwh });
    current.setTime(current.getTime() + ONE_DAY);
  }
  return filled;
}

/**
 * Smooth records using a simple moving average.
 */
function smoothRecords(records, windowSize = 7) {
  if (records.length <= windowSize) return records;
  const half = Math.floor(windowSize / 2);
  return records.map((r, i) => {
    const start = Math.max(0, i - half);
    const end = Math.min(records.length - 1, i + half);
    let sum = 0;
    let count = 0;
    for (let j = start; j <= end; j++) {
      sum += records[j].kwh;
      count++;
    }
    return { date: r.date, kwh: sum / count };
  });
}

/**
 * Convert kWh values to y-coordinates in the viewBox.
 * 0 kWh = bottom of viewBox (y = height), max kWh = near top.
 */
function kwhToY(kwh, maxKwh, height) {
  const usableTop = height * PADDING_TOP;
  const usableHeight = height - usableTop;
  return Math.round(height - (kwh / maxKwh) * usableHeight);
}

/**
 * Build a smooth bezier curve string through an array of {x, y} points.
 * Returns just the curve commands (no M prefix).
 */
function bezierThrough(points) {
  let d = '';
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cp = (curr.x - prev.x) / 3;
    d += `C${prev.x + cp},${prev.y},${curr.x - cp},${curr.y},${curr.x},${curr.y}`;
  }
  return d;
}

/**
 * Build a stacked area path between a top curve and a bottom curve.
 * Goes forward along top, then backward along bottom, closing the shape.
 */
function stackedAreaPath(topPoints, bottomPoints) {
  if (topPoints.length === 0) return '';

  // Forward along top curve
  let d = `M${topPoints[0].x},${topPoints[0].y}`;
  d += bezierThrough(topPoints);

  // Line down to bottom curve's last point, then backward along bottom
  const bottomReversed = [...bottomPoints].reverse();
  d += `L${bottomReversed[0].x},${bottomReversed[0].y}`;
  d += bezierThrough(bottomReversed);

  d += 'Z';
  return d;
}

/**
 * Build a stroke-only path (no area fill) through points.
 */
function strokePath(points) {
  if (points.length === 0) return '';
  let d = `M${points[0].x},${points[0].y}`;
  d += bezierThrough(points);
  return d;
}

// --- Build script ---

const STACK_LAYERS = [
  // Bottom to top stacking order
  { file: 'energy-daily-waterheater.csv', key: 'water' },
  { file: 'energy-daily-heatpump-heating.csv', key: 'heating' },
  { file: 'energy-daily-heatpump-cooling.csv', key: 'cooling' },
];

function build() {
  // Parse total load for the outline
  const totalRaw = parseCsv(fs.readFileSync(path.join(__dirname, 'energy-daily-kwh.csv'), 'utf-8'));

  // Parse stack layers
  const layerData = STACK_LAYERS.map(ds => ({
    ...ds,
    records: parseCsv(fs.readFileSync(path.join(__dirname, ds.file), 'utf-8'))
  }));

  // Global date range from total load (most complete coverage)
  const globalMinDate = totalRaw[0].date;
  const globalMaxDate = totalRaw[totalRaw.length - 1].date;

  // Fill zeros and smooth all datasets to get aligned daily series
  const totalSmoothed = smoothRecords(fillZeros(totalRaw, globalMinDate, globalMaxDate), 7);
  const layers = layerData.map(ds => ({
    ...ds,
    smoothed: smoothRecords(fillZeros(ds.records, globalMinDate, globalMaxDate), 7)
  }));

  // Use total load max for y-axis scale
  const globalMaxKwh = Math.max(...totalSmoothed.map(r => r.kwh));
  const timeRange = globalMaxDate - globalMinDate;

  // Convert dates to x-coordinates (shared across all layers)
  function dateToX(date) {
    return Math.round(((date - globalMinDate) / timeRange) * VIEW_W);
  }

  // Build cumulative stacks
  // cumulativeBelow[i] = sum of all layers below the current one at date index i
  const numDays = totalSmoothed.length;
  const cumulative = new Array(numDays).fill(0); // running cumulative

  const result = {};

  for (const layer of layers) {
    // Bottom curve = current cumulative
    const bottomPoints = layer.smoothed.map((r, i) => ({
      x: dateToX(r.date),
      y: kwhToY(cumulative[i], globalMaxKwh, VIEW_H)
    }));

    // Add this layer's values to cumulative
    for (let i = 0; i < numDays; i++) {
      cumulative[i] += layer.smoothed[i].kwh;
    }

    // Top curve = new cumulative
    const topPoints = layer.smoothed.map((r, i) => ({
      x: dateToX(r.date),
      y: kwhToY(cumulative[i], globalMaxKwh, VIEW_H)
    }));

    result[layer.key] = stackedAreaPath(topPoints, bottomPoints);
  }

  // Total load as stroke outline
  const totalPoints = totalSmoothed.map((r, i) => ({
    x: dateToX(r.date),
    y: kwhToY(r.kwh, globalMaxKwh, VIEW_H)
  }));
  result.total = strokePath(totalPoints);

  const outDir = path.join(__dirname, 'data');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
  fs.writeFileSync(path.join(outDir, 'svg-paths.json'), JSON.stringify(result, null, 2));
  console.log('Built SVG paths →', path.join(outDir, 'svg-paths.json'));
}

if (require.main === module) {
  build();
}

module.exports = { parseCsv, fillZeros, smoothRecords, kwhToY, bezierThrough, stackedAreaPath, strokePath };
