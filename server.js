import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// JSON file database for high scores
const SCORES_FILE = path.join(__dirname, 'scores.json');

const INITIAL_SCORES = [
  { name: 'Carlo Acutis', score: 15200, height: 1250, tercos: 27, date: '08/07/2026' },
  { name: 'Pe. Jonas', score: 9800, height: 820, tercos: 16, date: '08/07/2026' },
  { name: 'Mariana PJJ', score: 7400, height: 610, tercos: 13, date: '08/07/2026' },
  { name: 'Lucas Voc', score: 5200, height: 450, tercos: 7, date: '07/07/2026' },
  { name: 'Duda Acamp', score: 3100, height: 280, tercos: 3, date: '06/07/2026' }
];

// Helper to read scores
const readScores = () => {
  try {
    if (!fs.existsSync(SCORES_FILE)) {
      fs.writeFileSync(SCORES_FILE, JSON.stringify(INITIAL_SCORES, null, 2));
      return INITIAL_SCORES;
    }
    const data = fs.readFileSync(SCORES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading scores:', err);
    return INITIAL_SCORES;
  }
};

// Helper to write scores
const writeScores = (scores) => {
  try {
    fs.writeFileSync(SCORES_FILE, JSON.stringify(scores, null, 2));
  } catch (err) {
    console.error('Error writing scores:', err);
  }
};

// GET top 10 scores
app.get('/api/scores', (req, res) => {
  const scores = readScores();
  const sorted = scores.sort((a, b) => b.score - a.score).slice(0, 10);
  res.json(sorted);
});

// POST new score
app.post('/api/scores', (req, res) => {
  const { name, score, height, tercos } = req.body;
  if (!name || typeof score !== 'number') {
    return res.status(400).json({ error: 'Invalid score payload' });
  }

  const scores = readScores();
  scores.push({
    name: name.substring(0, 15),
    score,
    height: height || 0,
    tercos: tercos || 0,
    date: new Date().toLocaleDateString('pt-BR'),
    isPlayer: false // will be marked as player in client state locally
  });

  // Keep top 100 to prevent infinite file size growth
  const updated = scores.sort((a, b) => b.score - a.score).slice(0, 100);
  writeScores(updated);

  // Return top 10
  res.json(updated.slice(0, 10));
});

// Fallback all other routes to index.html for React SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
