import type { IncomingMessage, ServerResponse } from 'http';
import server from '../server.ts';

/**
 * Vercel catch-all for nested REST routes.
 * Explicit .ts import makes the root server module part of the function bundle.
 */
export default function handler(req: IncomingMessage, res: ServerResponse) {
  server.emit('request', req, res);
}
