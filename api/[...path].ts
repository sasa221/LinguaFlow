import type { IncomingMessage, ServerResponse } from 'http';
import server from '../server';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  server.emit('request', req, res);
}