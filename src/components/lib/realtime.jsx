import { isPreview } from './runtimeFlags';

export function startRealtime() {
  if (isPreview) {
    console.log('[realtime] disabled in preview');
    return () => {};
  }
  // חיבור אמיתי לפרוד (אם קיים)
  // const socket = io('wss://<your-ws-endpoint>', { transports: ['websocket'] });
  // return () => socket.close();
}