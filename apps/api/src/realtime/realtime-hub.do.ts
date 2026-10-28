import type {
  DurableObjectState,
  WebSocket,
  WebSocketPair as WebSocketPairType,
  WebSocketRequestResponsePair as WebSocketRequestResponsePairType,
} from '@cloudflare/workers-types';
import { DurableObject } from 'cloudflare:workers';

// Runtime globals of workerd (typed via @cloudflare/workers-types).
declare const WebSocketPair: typeof WebSocketPairType;
declare const WebSocketRequestResponsePair: typeof WebSocketRequestResponsePairType;

// Replaces the Socket.IO server. One instance per restaurant (tenant), so a
// restaurant's sockets can never share an object — or a broadcast — with
// another restaurant's.
//
// Rooms are WebSocket tags, the same two room kinds the Socket.IO gateway
// used:
//   branch:<branchId>  everyone viewing that branch (KDS, tables, orders)
//   user:<userId>      one staff member's sockets (targeted notifications)
//
// The Worker authenticates the upgrade request (session cookie + branch
// access check, see RealtimeGateway.authorizeUpgrade) before it ever reaches
// this object, and passes the verified ids in headers; nothing a client
// sends over the socket can change its rooms.
//
// Sockets use the hibernation API: an idle KDS screen costs no duration
// while the object is evicted, and the runtime answers the client's "ping"
// keep-alive without waking it.
//
// Wire format (server -> client): {"event": "kot.updated", "payload": {...}}.
// Pushes are hints to refetch, exactly as before; screens refetch everything
// after a reconnect, so a push missed while offline cannot leave them stale.
export class RealtimeHub extends DurableObject {
  constructor(ctx: DurableObjectState, env: unknown) {
    super(ctx, env as never);
    this.ctx.setWebSocketAutoResponse(
      new WebSocketRequestResponsePair('ping', 'pong'),
    );
  }

  fetch(request: Request): Response {
    if (request.headers.get('Upgrade')?.toLowerCase() !== 'websocket') {
      return new Response('Expected a WebSocket upgrade', { status: 426 });
    }
    const branchId = request.headers.get('X-Realtime-Branch');
    const userId = request.headers.get('X-Realtime-User');
    if (!branchId || !userId) {
      return new Response('Missing verified identity', { status: 400 });
    }
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.ctx.acceptWebSocket(server, [`branch:${branchId}`, `user:${userId}`]);
    server.serializeAttachment({ branchId, userId, at: Date.now() });
    return new Response(null, {
      status: 101,
      webSocket: client,
    } as ResponseInit);
  }

  // Called over RPC by RealtimeGateway after the change is committed to D1.
  broadcast(rooms: string[], event: string, payload: unknown): number {
    const message = JSON.stringify({ event, payload });
    const sent = new Set<WebSocket>();
    for (const room of rooms) {
      for (const ws of this.ctx.getWebSockets(room)) {
        if (sent.has(ws)) continue;
        sent.add(ws);
        try {
          ws.send(message);
        } catch {
          // Socket already closing; the runtime cleans it up.
        }
      }
    }
    return sent.size;
  }

  connectionCount(): number {
    return this.ctx.getWebSockets().length;
  }

  webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
    // Clients only ever send the keep-alive (answered by the auto-response
    // above without waking this object). Anything else is ignored: room
    // membership is fixed at upgrade time.
    if (message === 'ping') ws.send('pong');
  }

  webSocketClose(ws: WebSocket, code: number) {
    try {
      ws.close(code === 1005 ? 1000 : code, 'closed');
    } catch {
      // already closed
    }
  }

  webSocketError(ws: WebSocket) {
    try {
      ws.close(1011, 'error');
    } catch {
      // already closed
    }
  }
}
