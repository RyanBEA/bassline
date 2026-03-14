const express = require('express');
const path = require('node:path');
const { v4: uuidv4 } = require('uuid');
const { scoreAnswers, mapScoreToVideo, QUESTIONS } = require('./bass-mapping');

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

    try {
      const score = scoreAnswers(answers);
      const videoId = mapScoreToVideo(score);
      const id = uuidv4();
      results.set(id, videoId);

      res.json({ redirectUrl: `/report/${id}` });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // Report redirect
  app.get('/report/:id', (req, res) => {
    const videoId = results.get(req.params.id);
    if (!videoId) {
      return res.status(404).send('Report not found');
    }
    res.redirect(302, `https://www.youtube.com/watch?v=${videoId}`);
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
