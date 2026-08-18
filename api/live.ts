import { experimental_upgradeWebSocket, type WebSocketData } from '@vercel/functions';
import { GoogleGenAI, Modality } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'linguaflow-vercel',
    },
  },
});

type ClientMessage =
  | {
      type: 'init';
      language?: string;
      nativeLanguage?: string;
      level?: string;
      scenario?: {
        title?: string;
        role?: string;
        partnerRole?: string;
        setting?: string;
      };
      voice?: string;
      coachingLevel?: string;
    }
  | { type: 'audio'; audio: string }
  | { type: 'text'; text: string }
  | { type: 'interrupt' };

function toText(data: WebSocketData): string {
  if (typeof data === 'string') return data;
  if (data instanceof ArrayBuffer) return new TextDecoder().decode(data);
  if (ArrayBuffer.isView(data)) {
    return new TextDecoder().decode(data as ArrayBufferView<ArrayBuffer>);
  }
  return String(data);
}

export function GET() {
  return experimental_upgradeWebSocket((ws) => {
    let session: any = null;
    let sessionReady = false;
    let closed = false;

    const safeSend = (payload: unknown) => {
      if (closed) return;
      try {
        ws.send(JSON.stringify(payload));
      } catch (error) {
        console.error('[Live WS] send failed:', error);
      }
    };

    const closeGeminiSession = () => {
      if (!session) return;
      try {
        session.close?.();
      } catch (error) {
        console.warn('[Live WS] Gemini close warning:', error);
      }
      session = null;
      sessionReady = false;
    };

    ws.on('message', async (raw: WebSocketData) => {
      let msg: ClientMessage;
      try {
        msg = JSON.parse(toText(raw));
      } catch {
        safeSend({ type: 'error', message: 'Invalid Live Voice message.' });
        return;
      }

      if (msg.type === 'init') {
        if (!process.env.GEMINI_API_KEY) {
          safeSend({ type: 'error', message: 'Live Voice is not configured on the server.' });
          return;
        }

        closeGeminiSession();

        const language = msg.language || 'Spanish';
        const nativeLanguage = msg.nativeLanguage || 'Arabic (Egyptian)';
        const level = msg.level || 'A2';
        const partnerRole = msg.scenario?.partnerRole || 'Native Conversational Partner';
        const setting = msg.scenario?.setting || 'Everyday life';
        const coachingLevel = msg.coachingLevel || 'balanced';

        const systemInstruction = `You are playing the role of "${partnerRole}" in the setting: "${setting}".
The user is a language learner at CEFR level "${level}" learning "${language}".
Their native language is "${nativeLanguage}".

Live Coaching Mode: "${coachingLevel}".

Rules for spoken live voice interaction:
1. Speak primarily in ${language}, naturally and in character.
2. Keep each turn short and conversational (1-2 sentences for A0-A2, 2-3 for B1-B2).
3. Do not lecture. Prompt the learner to speak.
4. If the learner explicitly asks for help, give one brief hint in ${nativeLanguage}, then resume ${language}.
5. Begin immediately with an in-character greeting appropriate for the setting.`;

        try {
          session = await ai.live.connect({
            model: 'gemini-3.1-flash-live-preview',
            config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: msg.voice || 'Zephyr' },
                },
              },
              systemInstruction,
            },
            callbacks: {
              onopen: () => {
                console.log('[Gemini Live] upstream connected');
              },
              onmessage: (serverMessage: any) => {
                const parts = serverMessage?.serverContent?.modelTurn?.parts || [];
                for (const part of parts) {
                  const audio = part?.inlineData?.data;
                  if (audio) safeSend({ type: 'audio', audio });
                }

                if (serverMessage?.serverContent?.interrupted) {
                  safeSend({ type: 'interrupted' });
                }

                if (serverMessage?.serverContent?.turnComplete) {
                  safeSend({ type: 'turn_complete' });
                }
              },
              onerror: (error: any) => {
                console.error('[Gemini Live] upstream error:', error);
                safeSend({
                  type: 'error',
                  message: error?.message || 'Gemini Live session encountered an error.',
                });
              },
              onclose: (event: any) => {
                console.warn('[Gemini Live] upstream closed:', event?.reason || 'closed');
                sessionReady = false;
                if (!closed) safeSend({ type: 'ended' });
              },
            },
          });

          sessionReady = true;
          safeSend({ type: 'ready' });
        } catch (error: any) {
          console.error('[Gemini Live] connection failed:', error);
          safeSend({
            type: 'error',
            message: error?.message || 'Could not connect to Gemini Live voice stream.',
          });
        }
        return;
      }

      if (msg.type === 'audio' && msg.audio && session && sessionReady) {
        try {
          session.sendRealtimeInput({
            audio: {
              data: msg.audio,
              mimeType: 'audio/pcm;rate=16000',
            },
          });
        } catch (error) {
          console.error('[Gemini Live] audio input failed:', error);
        }
        return;
      }

      if (msg.type === 'text' && msg.text && session && sessionReady) {
        try {
          session.sendRealtimeInput({ text: msg.text });
        } catch (error) {
          console.error('[Gemini Live] text input failed:', error);
        }
        return;
      }

      // The browser immediately clears local playback on barge-in. Gemini's
      // automatic activity detection handles interruption as fresh user audio arrives.
      if (msg.type === 'interrupt') return;
    });

    ws.on('close', () => {
      closed = true;
      closeGeminiSession();
    });

    ws.on('error', (error: unknown) => {
      console.error('[Live WS] client socket error:', error);
    });
  });
}
