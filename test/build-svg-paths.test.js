const { describe, it } = require('node:test');
const assert = require('node:assert');
const { parseCsv, csvToPoints, pointsToAreaPath } = require('../build-svg-paths');

describe('parseCsv', () => {
  it('parses CSV text into sorted {date, kwh} records', () => {
    const csv = `date,kwh
2025-03-16,60
2025-03-14,40
2025-03-15,80`;
    const records = parseCsv(csv);
    assert.strictEqual(records.length, 3);
    // Should be sorted by date
    assert.strictEqual(records[0].kwh, 40);
    assert.strictEqual(records[1].kwh, 80);
    assert.strictEqual(records[2].kwh, 60);
  });
});

describe('csvToPoints', () => {
  it('converts records into normalized {x, y} points', () => {
    const records = parseCsv(`date,kwh
2025-03-14,40
2025-03-15,80
2025-03-16,60`);
    const points = csvToPoints(records, 1200, 400);

    assert.strictEqual(points.length, 3);
    // First point at x=0, last at x=1200
    assert.strictEqual(points[0].x, 0);
    assert.strictEqual(points[2].x, 1200);
    // Highest value (80) should map to lowest y (near 0), with padding
    assert.ok(points[1].y < points[0].y);
    assert.ok(points[1].y < points[2].y);
  });

  it('handles single data point', () => {
    const records = parseCsv(`date,kwh
2025-01-01,50`);
    const points = csvToPoints(records, 1200, 400);
    assert.strictEqual(points.length, 1);
    assert.strictEqual(points[0].x, 0);
  });

  it('scales y-values proportionally with a global kWh max', () => {
    // Small values (cooling ~10kWh) should appear much shorter than large values (total ~140kWh)
    const smallRecords = parseCsv(`date,kwh
2025-06-01,5
2025-06-02,10`);
    const largeRecords = parseCsv(`date,kwh
2025-06-01,50
2025-06-02,100`);
    const globalMax = 100;
    const smallPts = csvToPoints(smallRecords, 1200, 400, null, null, globalMax);
    const largePts = csvToPoints(largeRecords, 1200, 400, null, null, globalMax);
    // The large dataset's max point should be much higher (lower y) than the small one's
    const smallMinY = Math.min(...smallPts.map(p => p.y));
    const largeMinY = Math.min(...largePts.map(p => p.y));
    assert.ok(largeMinY < smallMinY, `Large dataset peak y=${largeMinY} should be < small peak y=${smallMinY}`);
  });

  it('positions seasonal data correctly with a global date range', () => {
    // Simulate cooling data (only summer) within a full-year range
    const records = parseCsv(`date,kwh
2025-06-01,5
2025-07-01,10
2025-08-01,7`);
    const globalMin = new Date('2025-01-01');
    const globalMax = new Date('2025-12-31');
    const points = csvToPoints(records, 1200, 400, globalMin, globalMax);

    assert.strictEqual(points.length, 3);
    // June 1 should be roughly at x=500 (not x=0)
    assert.ok(points[0].x > 400, `First point x=${points[0].x} should be > 400`);
    // Aug 1 should be roughly at x=700 (not x=1200)
    assert.ok(points[2].x < 800, `Last point x=${points[2].x} should be < 800`);
  });
});

describe('pointsToAreaPath', () => {
  it('creates a closed SVG area path string', () => {
    const points = [
      { x: 0, y: 300 },
      { x: 600, y: 100 },
      { x: 1200, y: 200 }
    ];
    const path = pointsToAreaPath(points, 400);

    // Should start with M (move to first point)
    assert.ok(path.startsWith('M0,300'));
    // Should end closing back to bottom-left
    assert.ok(path.endsWith('L0,400Z'));
    // Should contain bottom-right corner
    assert.ok(path.includes('L1200,400'));
  });

  it('uses smooth curves (C commands) between points', () => {
    const points = [
      { x: 0, y: 300 },
      { x: 400, y: 100 },
      { x: 800, y: 200 },
      { x: 1200, y: 150 }
    ];
    const path = pointsToAreaPath(points, 400);
    // Should contain cubic bezier commands for smooth curves
    assert.ok(path.includes('C'));
  });
});
