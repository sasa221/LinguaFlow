# LinguaFlow AI — Vercel deployment checklist

This export has been adapted so the existing Express + WebSocket server can be imported by Vercel instead of calling `listen()` in production.

## 1. Create the Vercel project

Import this folder/repository into Vercel. The included `vercel.json` enables Fluid Compute and gives the Express/WebSocket function a 300 second maximum duration.

## 2. Add the server secret

In **Vercel → Project Settings → Environment Variables**, add:

- `GEMINI_API_KEY` — your Gemini API key (server-side only)
- `APP_URL` — optional; set it to your production URL after the first deployment if you need canonical self-links

Never create `VITE_GEMINI_API_KEY` or otherwise expose the Gemini secret to the frontend.

## 3. Firebase Authentication

The Firebase web configuration in `firebase-applet-config.json` is client configuration and is expected to be public. For Google Sign-In to work on the deployed site, add the final Vercel hostname/custom domain to **Firebase Authentication → Settings → Authorized domains**.

## 4. Firestore rules

`firestore.rules` is included in the project, but deploying the web app to Vercel does **not** automatically publish Firestore rules. Publish the rules through Firebase Console/CLI before allowing real users.

## 5. Live Voice limitation on Vercel Hobby

Vercel Functions with Fluid Compute currently have a maximum duration of 300 seconds on Hobby. A single proxied Live Voice WebSocket session should therefore be designed/tested around a maximum of about five minutes on Hobby. Longer sessions require a plan/runtime with a longer duration or a dedicated long-lived backend.

## 6. Required post-deploy checks

1. Open `/api/health` and verify `{ "status": "ok" }`.
2. Test Google Sign-In and Firestore hydration.
3. Start a real Live Voice session from Chrome with microphone permission.
4. Confirm AI audio playback and barge-in interruption.
5. End the session and verify the review opens only once.
6. Test on iPhone Safari if mobile voice support matters for launch.

## Local development

```bash
npm install
npm run dev
```

The local server still listens on port 3000 and serves Vite through middleware. The browser and REST APIs remain same-origin; Live Voice connects to `/live`.
