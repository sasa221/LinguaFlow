// Route all REST /api/* requests through the existing Express server.
// The original request path is preserved by Vercel's catch-all function route,
// so existing handlers such as /api/chat and /api/session/analyze continue to work.
export { default } from '../server';
