import express from 'express';
import { createServer } from 'http';
import WebSocket, { WebSocketServer } from 'ws';

// Set up Express
const app = express();
const PORT = process.env.PORT || 3000;

// Optionally serve static files (like a test client)
app.use(express.static('public'));

// Create HTTP server
const server = createServer(app);

// Create a WebSocket server on top of the HTTP server
const wss = new WebSocketServer({ server });

// Define a type for the signaling messages
interface SignalMessage {
  type: 'offer' | 'answer' | 'candidate';
  payload: any;
}

// When a new client connects
wss.on('connection', (ws: WebSocket) => {
  console.log('New client connected');

  // Handle incoming messages
  ws.on('message', (data: WebSocket.RawData) => {
    try {
      const message: SignalMessage = JSON.parse(data.toString());
      console.log('Received message:', message);

      // Relay the message to all other connected clients
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(message));
        }
      });
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  // Handle client disconnects
  ws.on('close', () => {
    console.log('Client disconnected');
  });

  // Handle any connection errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Start the HTTP server (and thereby the WebSocket server)
server.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});

