const { describe, it } = require('node:test');
const assert = require('node:assert');
const { csvToPoints, pointsToAreaPath } = require('../build-svg-paths');

describe('csvToPoints', () => {
  it('parses CSV text into sorted {x, y} points normalized to viewBox', () => {
    const csv = `date,kwh
2025-03-14,40
2025-03-15,80
2025-03-16,60`;
    const points = csvToPoints(csv, 1200, 400);

    assert.strictEqual(points.length, 3);
    // First point at x=0, last at x=1200
    assert.strictEqual(points[0].x, 0);
    assert.strictEqual(points[2].x, 1200);
    // Highest value (80) should map to lowest y (near 0), with padding
    assert.ok(points[1].y < points[0].y);
    assert.ok(points[1].y < points[2].y);
  });

  it('handles single data point', () => {
    const csv = `date,kwh
2025-01-01,50`;
    const points = csvToPoints(csv, 1200, 400);
    assert.strictEqual(points.length, 1);
    assert.strictEqual(points[0].x, 0);
  });

  it('sorts by date regardless of CSV order', () => {
    const csv = `date,kwh
2025-03-16,60
2025-03-14,40
2025-03-15,80`;
    const points = csvToPoints(csv, 1200, 400);
    // After sorting, values should be 40, 80, 60
    assert.ok(points[0].y > points[1].y); // 40 is lower value = higher y
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
