import {
  Application,
} from "https://deno.land/x/abc@v1.1.0/mod.ts";
import { HandlerFunc } from "https://deno.land/x/abc@v1.1.0/types.ts";
import {
  acceptWebSocket,
  isWebSocketCloseEvent,
  WebSocket,
} from "https://deno.land/x/abc@v1.1.0/vendor/https/deno.land/std/ws/mod.ts";

const app = new Application();

let connections = new Array<WebSocket>();

const chat: HandlerFunc = async (c) => {
  const { conn, headers, r: bufReader, w: bufWriter } = c.request;
  const ws = await acceptWebSocket({
    conn,
    headers,
    bufReader,
    bufWriter,
  });

  connections.push(ws);

  console.log("Established connections", connections.length);

  for await (const event of ws) {
    if (isWebSocketCloseEvent(event)) {
      connections = connections.filter((c) => !c.isClosed);
      console.log("Websocket connection closed");
    } else {
      console.log(`Client sent: ${event}`);
      for (const websocket of connections) {
        websocket.send(`${event}`);
      }
    }
  }
};

console.log("server listening on http://localhost:8080");

app.get("/chat", chat).file("/", "./frontend/index.html").start({ port: 8080 });
