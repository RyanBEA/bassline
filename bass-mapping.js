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
  { name: 'Bass Line 1', url: 'https://www.youtube.com/shorts/LFr-MzVgCSk' },
  { name: 'Bass Line 2', url: 'https://www.youtube.com/shorts/xUyYANYtbf8' },
  { name: 'Bass Line 3', url: 'https://www.youtube.com/shorts/fCTmjo_G0sw' },
  { name: 'Bass Line 4', url: 'https://www.youtube.com/shorts/z_X_HtNqqAA' },
  { name: 'Bass Line 5', url: 'https://www.youtube.com/watch?v=OUTbj7sJJFA' },
  { name: 'Bass Line 6', url: 'https://www.youtube.com/shorts/SprscgWorq4' },
  { name: 'Bass Line 7', url: 'https://www.youtube.com/shorts/6UauEg5v7FQ' }
];

function scoreAnswers(answers) {
  if (answers.length !== 10) {
    throw new Error('Expected 10 answers');
  }

  for (let i = 0; i < 10; i++) {
    const idx = answers[i];
    if (!Number.isInteger(idx) || idx < 0 || idx > 3) {
      throw new Error('Answer index must be 0-3');
    }
  }
}

function mapScoreToVideo() {
  const index = Math.floor(Math.random() * VIDEOS.length);
  return VIDEOS[index].url;
}

module.exports = { QUESTIONS, VIDEOS, scoreAnswers, mapScoreToVideo };
