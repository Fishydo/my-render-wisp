import http from "http";
import { WebSocketServer } from "ws";
import { createWispServer } from "@mercuryworkshop/scramjet/server";

const PORT = process.env.PORT || 3000;

/*
  Basic HTTP server (required for Render)
*/
const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200);
    res.end("ok");
    return;
  }

  res.writeHead(200);
  res.end("Scramjet Wisp server running");
});

/*
  Create WebSocket server (noServer mode)
*/
const wss = new WebSocketServer({ noServer: true });

/*
  Create Scramjet Wisp server
*/
const wisp = createWispServer();

/*
  Handle WebSocket connections
*/
wss.on("connection", (ws, req) => {
  console.log("✅ Wisp connected");

  wisp.handleWebSocket(ws);

  ws.on("close", () => {
    console.log("❌ Wisp disconnected");
  });
});

/*
  Upgrade handler — MUST match /wisp/
*/
server.on("upgrade", (req, socket, head) => {
  if (req.url === "/wisp/") {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  } else {
    socket.destroy();
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Scramjet Wisp server listening on port ${PORT}`);
});
