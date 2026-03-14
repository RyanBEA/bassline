const { describe, it } = require('node:test');
const assert = require('node:assert');
const { parseCsv, fillZeros, smoothRecords, kwhToY, stackedAreaPath, strokePath } = require('../build-svg-paths');

describe('parseCsv', () => {
  it('parses CSV text into sorted {date, kwh} records', () => {
    const csv = `date,kwh
2025-03-16,60
2025-03-14,40
2025-03-15,80`;
    const records = parseCsv(csv);
    assert.strictEqual(records.length, 3);
    assert.strictEqual(records[0].kwh, 40);
    assert.strictEqual(records[1].kwh, 80);
    assert.strictEqual(records[2].kwh, 60);
  });
});

describe('fillZeros', () => {
  it('interpolates gaps within data range, zeros outside', () => {
    const records = parseCsv(`date,kwh
2025-01-02,10
2025-01-04,30`);
    const filled = fillZeros(records, new Date('2025-01-01'), new Date('2025-01-05'));
    assert.strictEqual(filled.length, 5);
    assert.strictEqual(filled[0].kwh, 0);  // Jan 1: before data range → 0
    assert.strictEqual(filled[1].kwh, 10); // Jan 2: known value
    assert.strictEqual(filled[2].kwh, 20); // Jan 3: interpolated between 10 and 30
    assert.strictEqual(filled[3].kwh, 30); // Jan 4: known value
    assert.strictEqual(filled[4].kwh, 0);  // Jan 5: after data range → 0
  });
});

describe('kwhToY', () => {
  it('maps 0 kWh to bottom of viewBox', () => {
    const y = kwhToY(0, 100, 400);
    assert.strictEqual(y, 400);
  });

  it('maps max kWh to near top of viewBox', () => {
    const y = kwhToY(100, 100, 400);
    assert.ok(y < 50, `y=${y} should be near top`);
  });
});

describe('stackedAreaPath', () => {
  it('creates a closed path between top and bottom curves', () => {
    const top = [{ x: 0, y: 100 }, { x: 600, y: 50 }, { x: 1200, y: 100 }];
    const bottom = [{ x: 0, y: 400 }, { x: 600, y: 400 }, { x: 1200, y: 400 }];
    const path = stackedAreaPath(top, bottom);
    assert.ok(path.startsWith('M0,100'));
    assert.ok(path.endsWith('Z'));
    assert.ok(path.includes('C')); // bezier curves
  });
});

describe('strokePath', () => {
  it('creates an open path through points', () => {
    const points = [{ x: 0, y: 300 }, { x: 600, y: 100 }, { x: 1200, y: 200 }];
    const path = strokePath(points);
    assert.ok(path.startsWith('M0,300'));
    assert.ok(path.includes('C'));
    assert.ok(!path.includes('Z')); // not closed
  });
});
