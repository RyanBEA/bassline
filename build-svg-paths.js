const fs = require('node:fs');
const path = require('node:path');

const VIEW_W = 1200;
const VIEW_H = 400;
const PADDING_TOP = 0.1;  // 10% padding at top
const PADDING_BOT = 0.15; // 15% padding at bottom (area fades into bg)

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

/**
 * Smooth records using a simple moving average over a window of days.
 * Preserves dates, only smooths kwh values. Zero-padding points are kept as-is.
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
 * Convert parsed records into normalized {x, y} points fitting a viewBox.
 * X-positions are based on actual dates within a global time range, so
 * seasonal datasets (e.g. cooling) only occupy their correct portion of the chart.
 * Y-axis uses a shared global kWh range so datasets are visually proportional.
 * Y-axis is inverted (SVG convention: 0 is top).
 *
 * @param {Array} records - Parsed {date, kwh} records
 * @param {number} width - ViewBox width
 * @param {number} height - ViewBox height
 * @param {Date} [globalMinDate] - Start of global time range (defaults to dataset min)
 * @param {Date} [globalMaxDate] - End of global time range (defaults to dataset max)
 * @param {number} [globalMaxKwh] - Max kWh across all datasets (defaults to dataset max)
 */
function csvToPoints(records, width, height, globalMinDate, globalMaxDate, globalMaxKwh) {
  if (records.length === 0) return [];

  const minDate = globalMinDate || records[0].date;
  const maxDate = globalMaxDate || records[records.length - 1].date;
  const timeRange = maxDate - minDate || 1;

  const maxKwh = globalMaxKwh || Math.max(...records.map(d => d.kwh));
  const range = maxKwh || 1; // 0 to maxKwh (not min-to-max)

  const usableTop = height * PADDING_TOP;
  const usableBottom = height * (1 - PADDING_BOT);
  const usableHeight = usableBottom - usableTop;

  return records.map(d => ({
    x: Math.round(((d.date - minDate) / timeRange) * width),
    y: Math.round(usableBottom - (d.kwh / range) * usableHeight)
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
  { file: 'energy-daily-heatpump-heating.csv', key: 'heating', seasonal: true },
  { file: 'energy-daily-heatpump-cooling.csv', key: 'cooling', seasonal: true },
  { file: 'energy-daily-waterheater.csv', key: 'water' }
];

const ONE_DAY = 24 * 60 * 60 * 1000;

/**
 * Fill a complete daily series from globalMinDate to globalMaxDate.
 * Days with data keep their kWh value; missing days get 0.
 * This ensures gaps (e.g. no heating in summer) render as actual zeros
 * rather than bezier interpolation across the gap.
 */
function fillZeros(records, globalMinDate, globalMaxDate) {
  // Build a lookup of existing data by date string
  const lookup = new Map();
  for (const r of records) {
    lookup.set(r.date.toISOString().slice(0, 10), r.kwh);
  }

  const filled = [];
  const current = new Date(globalMinDate);
  while (current <= globalMaxDate) {
    const key = current.toISOString().slice(0, 10);
    filled.push({ date: new Date(current), kwh: lookup.get(key) || 0 });
    current.setTime(current.getTime() + ONE_DAY);
  }
  return filled;
}

function build() {
  // Parse all datasets first to find the global date range
  const parsed = DATASETS.map(ds => {
    const csvPath = path.join(__dirname, ds.file);
    const csv = fs.readFileSync(csvPath, 'utf-8');
    return { ...ds, records: parseCsv(csv) };
  });

  // Global date and kWh ranges so all charts share the same axes
  const allDates = parsed.flatMap(ds => ds.records.map(r => r.date));
  const globalMinDate = new Date(Math.min(...allDates));
  const globalMaxDate = new Date(Math.max(...allDates));
  const globalMaxKwh = Math.max(...parsed.flatMap(ds => ds.records.map(r => r.kwh)));

  const result = {};
  for (const ds of parsed) {
    let records = ds.seasonal
      ? fillZeros(ds.records, globalMinDate, globalMaxDate)
      : ds.records;
    records = smoothRecords(records, 7);
    const points = csvToPoints(records, VIEW_W, VIEW_H, globalMinDate, globalMaxDate, globalMaxKwh);
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

module.exports = { parseCsv, csvToPoints, pointsToAreaPath };
