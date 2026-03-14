const { describe, it } = require('node:test');
const assert = require('node:assert');
const { scoreAnswers, mapScoreToVideo, QUESTIONS, VIDEOS } = require('../bass-mapping');

describe('QUESTIONS', () => {
  it('has exactly 10 questions', () => {
    assert.strictEqual(QUESTIONS.length, 10);
  });

  it('each question has exactly 4 options with 3 dimension scores', () => {
    for (const q of QUESTIONS) {
      assert.strictEqual(q.options.length, 4, `Question "${q.text}" should have 4 options`);
      for (const opt of q.options) {
        assert.ok('warmth' in opt.scores, `Option "${opt.label}" missing warmth`);
        assert.ok('intensity' in opt.scores, `Option "${opt.label}" missing intensity`);
        assert.ok('complexity' in opt.scores, `Option "${opt.label}" missing complexity`);
      }
    }
  });
});

describe('scoreAnswers', () => {
  it('sums dimension scores for given answer indices', () => {
    const answers = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const score = scoreAnswers(answers);
    assert.ok('warmth' in score);
    assert.ok('intensity' in score);
    assert.ok('complexity' in score);
    assert.strictEqual(typeof score.warmth, 'number');
  });

  it('throws on wrong number of answers', () => {
    assert.throws(() => scoreAnswers([0, 0, 0]), /10 answers/);
  });

  it('throws on out-of-range answer index', () => {
    assert.throws(() => scoreAnswers([0, 0, 0, 0, 0, 0, 0, 0, 0, 5]), /0-3/);
  });
});

describe('mapScoreToVideo', () => {
  it('returns a YouTube video ID string', () => {
    const videoId = mapScoreToVideo({ warmth: 5, intensity: 5, complexity: 5 });
    assert.strictEqual(typeof videoId, 'string');
    assert.ok(videoId.length > 5);
  });

  it('maps low-low-low to Stand By Me', () => {
    const videoId = mapScoreToVideo({ warmth: 0, intensity: 0, complexity: 0 });
    assert.strictEqual(videoId, 'oIBtePb-dGY');
  });

  it('maps high-high-high to Under Pressure', () => {
    const videoId = mapScoreToVideo({ warmth: 30, intensity: 30, complexity: 30 });
    assert.strictEqual(videoId, 'a01QQZyl-_I');
  });

  it('is deterministic — same score always maps to same video', () => {
    const score = { warmth: 12, intensity: 18, complexity: 7 };
    const v1 = mapScoreToVideo(score);
    const v2 = mapScoreToVideo(score);
    assert.strictEqual(v1, v2);
  });
});

describe('VIDEOS', () => {
  it('has exactly 8 entries', () => {
    assert.strictEqual(VIDEOS.length, 8);
  });
});
