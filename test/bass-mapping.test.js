const { describe, it } = require('node:test');
const assert = require('node:assert');
const { scoreAnswers, mapScoreToVideo, QUESTIONS, VIDEOS } = require('../bass-mapping');

describe('QUESTIONS', () => {
  it('has exactly 10 questions', () => {
    assert.strictEqual(QUESTIONS.length, 10);
  });

  it('each question has exactly 4 options', () => {
    for (const q of QUESTIONS) {
      assert.strictEqual(q.options.length, 4, `Question "${q.text}" should have 4 options`);
    }
  });
});

describe('scoreAnswers', () => {
  it('accepts valid answers without throwing', () => {
    assert.doesNotThrow(() => scoreAnswers([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]));
  });

  it('throws on wrong number of answers', () => {
    assert.throws(() => scoreAnswers([0, 0, 0]), /10 answers/);
  });

  it('throws on out-of-range answer index', () => {
    assert.throws(() => scoreAnswers([0, 0, 0, 0, 0, 0, 0, 0, 0, 5]), /0-3/);
  });
});

describe('mapScoreToVideo', () => {
  it('returns a YouTube URL', () => {
    const url = mapScoreToVideo();
    assert.ok(url.includes('youtube.com'), `Expected YouTube URL, got: ${url}`);
  });

  it('returns a URL from the VIDEOS list', () => {
    const urls = VIDEOS.map(v => v.url);
    for (let i = 0; i < 20; i++) {
      const url = mapScoreToVideo();
      assert.ok(urls.includes(url), `Unexpected URL: ${url}`);
    }
  });
});

describe('VIDEOS', () => {
  it('has 7 entries', () => {
    assert.strictEqual(VIDEOS.length, 7);
  });

  it('each has a url field', () => {
    for (const v of VIDEOS) {
      assert.ok(v.url.startsWith('https://'), `Bad URL: ${v.url}`);
    }
  });
});
