// Browser side of the realtime channel (replaces socket.io-client).
//
// The API upgrades GET /api/realtime?branchId=… to a WebSocket owned by the
// restaurant's RealtimeHub Durable Object, after checking the session cookie
// and branch access. Messages are JSON {event, payload}. This wrapper keeps
// the small part of the Socket.IO client API the screens used:
//   socket.on("connect" | "disconnect" | "connect_error" | <event>, fn)
//   socket.disconnect()
// plus Socket.IO's behaviour that mattered: automatic reconnection with
// backoff, and a keep-alive so idle kitchen tablets notice a dead link.
import { resolveWsUrl } from "@/lib/ws-url";

type Listener = (payload?: unknown) => void;

const PING_EVERY_MS = 25_000;
const PONG_TIMEOUT_MS = 10_000;
const MAX_BACKOFF_MS = 15_000;

export interface RealtimeSocket {
  on(event: string, listener: Listener): void;
  disconnect(): void;
}

export function connectRealtime(branchId: string): RealtimeSocket {
  const listeners = new Map<string, Set<Listener>>();
  let ws: WebSocket | null = null;
  let closedByUs = false;
  let attempt = 0;
  let pingTimer: ReturnType<typeof setInterval> | undefined;
  let pongTimer: ReturnType<typeof setTimeout> | undefined;
  let retryTimer: ReturnType<typeof setTimeout> | undefined;

  const emit = (event: string, payload?: unknown) =>
    listeners.get(event)?.forEach((fn) => fn(payload));

  const stopTimers = () => {
    clearInterval(pingTimer);
    clearTimeout(pongTimer);
  };

  const scheduleReconnect = () => {
    if (closedByUs) return;
    // 0.5s, 1s, 2s, 4s … capped, with jitter so a restored network does not
    // reconnect every tablet in the same millisecond.
    const delay = Math.min(MAX_BACKOFF_MS, 500 * 2 ** attempt) * (0.75 + Math.random() / 2);
    attempt += 1;
    retryTimer = setTimeout(open, delay);
  };

  function open() {
    const url = `${resolveWsUrl()}/api/realtime?branchId=${encodeURIComponent(branchId)}`;
    let socket: WebSocket;
    try {
      socket = new WebSocket(url);
    } catch {
      emit("connect_error");
      scheduleReconnect();
      return;
    }
    ws = socket;
    let opened = false;

    socket.onopen = () => {
      opened = true;
      attempt = 0;
      emit("connect");
      pingTimer = setInterval(() => {
        if (socket.readyState !== WebSocket.OPEN) return;
        socket.send("ping");
        clearTimeout(pongTimer);
        pongTimer = setTimeout(() => socket.close(4000, "keep-alive timeout"), PONG_TIMEOUT_MS);
      }, PING_EVERY_MS);
    };
    socket.onmessage = (e) => {
      if (e.data === "pong") {
        clearTimeout(pongTimer);
        return;
      }
      try {
        const msg = JSON.parse(String(e.data)) as { event?: string; payload?: unknown };
        if (msg.event) emit(msg.event, msg.payload);
      } catch {
        // Not a message we understand; ignore it.
      }
    };
    socket.onclose = () => {
      stopTimers();
      if (ws === socket) ws = null;
      emit(opened ? "disconnect" : "connect_error");
      scheduleReconnect();
    };
    socket.onerror = () => {
      // onclose follows and handles reconnection.
    };
  }

  open();

  return {
    on(event, listener) {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event)!.add(listener);
    },
    disconnect() {
      closedByUs = true;
      clearTimeout(retryTimer);
      stopTimers();
      ws?.close(1000, "client closed");
      ws = null;
    },
  };
}
