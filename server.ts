import express from 'express';
import http from 'http';

const app = express();
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', local: true, time: new Date().toISOString() });
});

const server = http.createServer(app);
const PORT = 3000;

if (process.env.VERCEL !== '1') {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`LinguaFlow local server running on http://0.0.0.0:${PORT}`);
  });
}

export default server;
