const express = require('express');
const path = require('node:path');
const { v4: uuidv4 } = require('uuid');
const fs = require('node:fs');
const { scoreAnswers, mapScoreToVideo, extractVideoId, QUESTIONS } = require('./bass-mapping');

function createApp() {
  const app = express();
  const results = new Map(); // UUID → YouTube video ID

  app.use(express.json());
  app.use(express.static(path.join(__dirname, 'public')));

  // Landing page
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'landing.html'));
  });

  // Survey page
  app.get('/assess', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'survey.html'));
  });

  // Loading/analysis animation page
  app.get('/loading', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'loading.html'));
  });

  // Survey questions data (for the frontend to render)
  app.get('/api/questions', (req, res) => {
    // Send questions without scores (don't reveal the mapping!)
    const sanitized = QUESTIONS.map(q => ({
      text: q.text,
      options: q.options.map(o => ({ label: o.label, value: o.value }))
    }));
    res.json(sanitized);
  });

  // Chart data for landing page background
  app.get('/api/chart-data', (req, res) => {
    try {
      const data = require('./data/svg-paths.json');
      res.json(data);
    } catch {
      res.status(500).json({ error: 'Chart data not built. Run: npm run build' });
    }
  });

  // Process survey answers
  app.post('/assess', (req, res) => {
    const { answers } = req.body;

    if (!Array.isArray(answers)) {
      return res.status(400).json({ error: 'answers must be an array' });
    }

    try {
      scoreAnswers(answers); // validates input
      const videoUrl = mapScoreToVideo();
      const id = uuidv4();
      results.set(id, videoUrl);

      res.json({ redirectUrl: `/report/${id}` });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // Report page with embedded video
  app.get('/report/:id', (req, res) => {
    const videoUrl = results.get(req.params.id);
    if (!videoUrl) {
      return res.status(404).send('Report not found');
    }
    const videoId = extractVideoId(videoUrl);
    const template = fs.readFileSync(path.join(__dirname, 'views', 'report.html'), 'utf-8');
    res.send(template.replace('{{VIDEO_ID}}', videoId));
  });

  return app;
}

// Start server when run directly
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  const app = createApp();
  app.listen(PORT, () => {
    console.log(`BASELINE running on http://localhost:${PORT}`);
  });
}

module.exports = { createApp };
