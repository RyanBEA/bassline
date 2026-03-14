const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const { createApp } = require('../server');

// Simple test helper: make requests to the Express app
async function request(app, method, path, body) {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, () => {
      const port = server.address().port;
      const url = `http://localhost:${port}${path}`;
      const headers = {};

      if (body) {
        headers['Content-Type'] = 'application/json';
      }

      fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        redirect: 'manual'
      })
        .then(async res => {
          const text = await res.text().catch(() => '');
          server.close();
          resolve({
            status: res.status,
            headers: Object.fromEntries(res.headers.entries()),
            body: text
          });
        })
        .catch(err => {
          server.close();
          reject(err);
        });
    });
  });
}

describe('GET /', () => {
  it('returns 200 with HTML', async () => {
    const app = createApp();
    const res = await request(app, 'GET', '/');
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.includes('BASELINE'));
  });
});

describe('GET /assess', () => {
  it('returns 200 with survey HTML', async () => {
    const app = createApp();
    const res = await request(app, 'GET', '/assess');
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.includes('html'));
  });
});

describe('POST /assess', () => {
  it('returns JSON with redirect URL on valid answers', async () => {
    const app = createApp();
    const res = await request(app, 'POST', '/assess', {
      answers: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    });
    assert.strictEqual(res.status, 200);
    const data = JSON.parse(res.body);
    assert.ok(data.redirectUrl.startsWith('/report/'));
  });

  it('returns 400 on invalid answers', async () => {
    const app = createApp();
    const res = await request(app, 'POST', '/assess', {
      answers: [0, 0]
    });
    assert.strictEqual(res.status, 400);
  });
});

describe('GET /report/:id', () => {
  it('redirects to YouTube for a valid UUID', async () => {
    const app = createApp();
    // First, create a result
    const postRes = await request(app, 'POST', '/assess', {
      answers: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    });
    const { redirectUrl } = JSON.parse(postRes.body);

    const reportRes = await request(app, 'GET', redirectUrl);
    assert.strictEqual(reportRes.status, 302);
    assert.ok(reportRes.headers.location.includes('youtube.com'));
  });

  it('returns 404 for unknown UUID', async () => {
    const app = createApp();
    const res = await request(app, 'GET', '/report/nonexistent-uuid');
    assert.strictEqual(res.status, 404);
  });
});

describe('GET /api/questions', () => {
  it('returns 10 questions with options but no scores', async () => {
    const app = createApp();
    const res = await request(app, 'GET', '/api/questions');
    assert.strictEqual(res.status, 200);
    const questions = JSON.parse(res.body);
    assert.strictEqual(questions.length, 10);
    for (const q of questions) {
      assert.ok(q.text);
      assert.strictEqual(q.options.length, 4);
      for (const opt of q.options) {
        assert.ok('label' in opt);
        assert.ok('value' in opt);
        assert.strictEqual(opt.scores, undefined, 'Scores must not be exposed to client');
      }
    }
  });
});

describe('GET /api/chart-data', () => {
  it('returns JSON with SVG path data', async () => {
    const app = createApp();
    const res = await request(app, 'GET', '/api/chart-data');
    assert.strictEqual(res.status, 200);
    const data = JSON.parse(res.body);
    assert.ok('total' in data);
    assert.ok('heating' in data);
    assert.ok('cooling' in data);
    assert.ok('water' in data);
  });
});
