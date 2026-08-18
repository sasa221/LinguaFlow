import http from 'http';
import { createApp } from './api/_app';

const app = await createApp();
const server = http.createServer(app);
const PORT = 3000;

if (process.env.VERCEL !== '1') {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`LinguaFlow Server running on http://0.0.0.0:${PORT}`);
  });
}

export default server;
