const QUESTIONS = [
  {
    text: 'What type of building are you assessing?',
    options: [
      { label: 'Residential',   value: 0, scores: { warmth: 2, intensity: 1, complexity: 0 } },
      { label: 'Commercial',    value: 1, scores: { warmth: 1, intensity: 2, complexity: 1 } },
      { label: 'Industrial',    value: 2, scores: { warmth: 0, intensity: 3, complexity: 2 } },
      { label: 'Institutional', value: 3, scores: { warmth: 1, intensity: 1, complexity: 3 } }
    ]
  },
  {
    text: 'Approximately how large is the building?',
    options: [
      { label: 'Under 5,000 sq ft',   value: 0, scores: { warmth: 2, intensity: 0, complexity: 0 } },
      { label: '5,000 – 25,000 sq ft', value: 1, scores: { warmth: 1, intensity: 1, complexity: 1 } },
      { label: '25,000 – 100,000 sq ft', value: 2, scores: { warmth: 0, intensity: 2, complexity: 2 } },
      { label: 'Over 100,000 sq ft',   value: 3, scores: { warmth: 0, intensity: 3, complexity: 3 } }
    ]
  },
  {
    text: 'What year was the building constructed?',
    options: [
      { label: 'Pre-1970',   value: 0, scores: { warmth: 3, intensity: 1, complexity: 1 } },
      { label: '1970 – 1990', value: 1, scores: { warmth: 2, intensity: 2, complexity: 1 } },
      { label: '1990 – 2010', value: 2, scores: { warmth: 1, intensity: 2, complexity: 2 } },
      { label: 'Post-2010',  value: 3, scores: { warmth: 0, intensity: 1, complexity: 3 } }
    ]
  },
  {
    text: "How would you describe the building's typical occupancy pattern?",
    options: [
      { label: 'Steady',           value: 0, scores: { warmth: 2, intensity: 0, complexity: 0 } },
      { label: 'Peaks and valleys', value: 1, scores: { warmth: 1, intensity: 2, complexity: 2 } },
      { label: 'Variable',         value: 2, scores: { warmth: 0, intensity: 2, complexity: 3 } },
      { label: 'Minimal',          value: 3, scores: { warmth: 1, intensity: 0, complexity: 1 } }
    ]
  },
  {
    text: 'What is the primary heating source?',
    options: [
      { label: 'Electric',      value: 0, scores: { warmth: 1, intensity: 2, complexity: 1 } },
      { label: 'Natural gas',   value: 1, scores: { warmth: 3, intensity: 1, complexity: 0 } },
      { label: 'Heat pump',     value: 2, scores: { warmth: 1, intensity: 1, complexity: 3 } },
      { label: 'Oil / propane', value: 3, scores: { warmth: 3, intensity: 2, complexity: 0 } }
    ]
  },
  {
    text: "How would you characterize the building's overall tone?",
    options: [
      { label: 'Tight and efficient',   value: 0, scores: { warmth: 0, intensity: 1, complexity: 2 } },
      { label: 'Warm but dated',         value: 1, scores: { warmth: 3, intensity: 1, complexity: 1 } },
      { label: 'Cool and underperforming', value: 2, scores: { warmth: 0, intensity: 2, complexity: 2 } },
      { label: "It's complicated",       value: 3, scores: { warmth: 1, intensity: 2, complexity: 3 } }
    ]
  },
  {
    text: "How would you describe the relationship between the building's systems?",
    options: [
      { label: 'They work in harmony', value: 0, scores: { warmth: 3, intensity: 0, complexity: 0 } },
      { label: 'Some tension',          value: 1, scores: { warmth: 1, intensity: 2, complexity: 2 } },
      { label: 'Operate independently', value: 2, scores: { warmth: 0, intensity: 1, complexity: 1 } },
      { label: 'Not sure',              value: 3, scores: { warmth: 1, intensity: 1, complexity: 2 } }
    ]
  },
  {
    text: "What best describes the building's energy use over a typical day?",
    options: [
      { label: 'Flat',                          value: 0, scores: { warmth: 1, intensity: 0, complexity: 0 } },
      { label: 'Builds gradually, peaks late',   value: 1, scores: { warmth: 2, intensity: 2, complexity: 1 } },
      { label: 'Drops off after morning',        value: 2, scores: { warmth: 1, intensity: 2, complexity: 1 } },
      { label: 'Repeats in a regular pattern',   value: 3, scores: { warmth: 0, intensity: 1, complexity: 3 } }
    ]
  },
  {
    text: 'How often does major equipment cycle on and off?',
    options: [
      { label: 'Rarely',          value: 0, scores: { warmth: 2, intensity: 0, complexity: 0 } },
      { label: 'Moderately',      value: 1, scores: { warmth: 1, intensity: 1, complexity: 1 } },
      { label: 'Frequently',      value: 2, scores: { warmth: 0, intensity: 3, complexity: 2 } },
      { label: 'Varies by season', value: 3, scores: { warmth: 1, intensity: 2, complexity: 3 } }
    ]
  },
  {
    text: "What's driving your interest in establishing a baseline?",
    options: [
      { label: 'Reducing costs',              value: 0, scores: { warmth: 1, intensity: 2, complexity: 1 } },
      { label: 'Regulatory requirements',     value: 1, scores: { warmth: 0, intensity: 1, complexity: 3 } },
      { label: 'Preparing for retrofit',      value: 2, scores: { warmth: 1, intensity: 3, complexity: 2 } },
      { label: "Just curious what my building's groove is", value: 3, scores: { warmth: 3, intensity: 0, complexity: 0 } }
    ]
  }
];

const VIDEOS = [
  { name: 'Stand By Me',              id: 'oIBtePb-dGY' },  // 000: L-L-L
  { name: 'Money',                    id: '-0kcet4aPpQ' },  // 001: L-L-H
  { name: 'Another One Bites the Dust', id: 'rY0WxgSXdEE' },// 010: L-H-L
  { name: 'Schism',                   id: 'UhjG47gtMCo' },  // 011: L-H-H
  { name: 'Seinfeld Theme',           id: '_V2sBURgUBI' },  // 100: H-L-L
  { name: 'Come Together',            id: 'axb2sHpGwHQ' },  // 101: H-L-H
  { name: 'Billie Jean',              id: 'Zi_XLOBDo_Y' },  // 110: H-H-L
  { name: 'Under Pressure',           id: 'a01QQZyl-_I' }   // 111: H-H-H
];

const MIDPOINT = 15;

function scoreAnswers(answers) {
  if (answers.length !== 10) {
    throw new Error('Expected 10 answers');
  }

  const score = { warmth: 0, intensity: 0, complexity: 0 };

  for (let i = 0; i < 10; i++) {
    const idx = answers[i];
    if (idx < 0 || idx > 3) {
      throw new Error('Answer index must be 0-3');
    }
    const opt = QUESTIONS[i].options[idx];
    score.warmth += opt.scores.warmth;
    score.intensity += opt.scores.intensity;
    score.complexity += opt.scores.complexity;
  }

  return score;
}

function mapScoreToVideo(score) {
  const w = score.warmth >= MIDPOINT ? 1 : 0;
  const i = score.intensity >= MIDPOINT ? 1 : 0;
  const c = score.complexity >= MIDPOINT ? 1 : 0;
  const index = (w << 2) | (i << 1) | c;
  return VIDEOS[index].id;
}

module.exports = { QUESTIONS, VIDEOS, scoreAnswers, mapScoreToVideo };
