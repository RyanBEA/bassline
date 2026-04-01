const { describe, it } = require('node:test');
const assert = require('node:assert');
const { scoreAnswers, mapScoreToVideo, extractVideoId, QUESTIONS, VIDEOS } = require('../bass-mapping');

describe('QUESTIONS', () => {
  it('has exactly 7 questions', () => {
    assert.strictEqual(QUESTIONS.length, 7);
  });

  it('each question has exactly 4 options', () => {
    for (const q of QUESTIONS) {
      assert.strictEqual(q.options.length, 4, `Question "${q.text}" should have 4 options`);
    }
  });
});

describe('scoreAnswers', () => {
  it('accepts valid answers without throwing', () => {
    assert.doesNotThrow(() => scoreAnswers([0, 0, 0, 0, 0, 0, 0]));
  });

  it('throws on wrong number of answers', () => {
    assert.throws(() => scoreAnswers([0, 0, 0]), /7 answers/);
  });

  it('throws on out-of-range answer index', () => {
    assert.throws(() => scoreAnswers([0, 0, 0, 0, 0, 0, 5]), /0-3/);
  });
});

describe('mapScoreToVideo', () => {
  it('returns a YouTube URL', () => {
    const url = mapScoreToVideo();
    assert.ok(url.includes('youtu'), `Expected YouTube URL, got: ${url}`);
  });

  it('returns a URL from the VIDEOS list', () => {
    const urls = VIDEOS.map(v => v.url);
    for (let i = 0; i < 20; i++) {
      const url = mapScoreToVideo();
      assert.ok(urls.includes(url), `Unexpected URL: ${url}`);
    }
  });
});

describe('extractVideoId', () => {
  it('extracts ID from youtube.com/shorts/ URL', () => {
    assert.strictEqual(extractVideoId('https://www.youtube.com/shorts/LFr-MzVgCSk'), 'LFr-MzVgCSk');
  });

  it('extracts ID from youtube.com/watch?v= URL', () => {
    assert.strictEqual(extractVideoId('https://www.youtube.com/watch?v=OUTbj7sJJFA'), 'OUTbj7sJJFA');
  });

  it('extracts ID from youtu.be/ URL', () => {
    assert.strictEqual(extractVideoId('https://youtu.be/kAT3aVj-A_E'), 'kAT3aVj-A_E');
  });

  it('extracts ID from every video in VIDEOS list', () => {
    for (const v of VIDEOS) {
      const id = extractVideoId(v.url);
      assert.ok(id, `Failed to extract ID from: ${v.url}`);
    }
  });

  it('returns null for non-YouTube URL', () => {
    assert.strictEqual(extractVideoId('https://example.com/video'), null);
  });
});

describe('VIDEOS', () => {
  it('has 23 entries', () => {
    assert.strictEqual(VIDEOS.length, 23);
  });

  it('each has a url field', () => {
    for (const v of VIDEOS) {
      assert.ok(v.url.startsWith('https://'), `Bad URL: ${v.url}`);
    }
  });
});
