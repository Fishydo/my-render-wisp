import http from "http";
import fetch from "node-fetch";
import { WebSocketServer } from "ws";
import scramjet from "@mercuryworkshop/scramjet";

const PORT = process.env.PORT || 3000;
const SELF_URL = process.env.SELF_URL; // set this in Render

// Basic HTTP server (required for Render + pinging)
const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200);
    res.end("ok");
    return;
  }

  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Scramjet WSS server running");
});

// WebSocket server
const wss = new WebSocketServer({ server });

wss.on("connection", (ws, req) => {
  console.log("New WSS connection");

  const client = scramjet.createClient({
    send: (data) => ws.send(data),
    close: () => ws.close()
  });

  ws.on("message", (data) => {
    client.handleMessage(data);
  });

  ws.on("close", () => {
    client.close();
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// 🔁 OPTIONAL self-ping (won't wake sleeping service)
if (SELF_URL) {
  setInterval(async () => {
    try {
      await fetch(`${SELF_URL}/health`);
      console.log("Self-ping ok");
    } catch (e) {
      console.error("Self-ping failed");
    }
  }, 4 * 60 * 1000);
}
