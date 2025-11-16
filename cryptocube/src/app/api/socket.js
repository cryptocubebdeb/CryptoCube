//This was written following this tutorial: https://medium.com/@saadiqbalch786/implementing-web-sockets-with-next-js-and-api-routes-a-guide-d6143e3edcb0

import WebSocket from 'ws';
export default async function handler(req, res) {
    const wss = new WebSocket.Server({ noServer: true });
    wss.on('connection', function connection(ws) {
        ws.on('message', function incoming(message) {
            console.log('received: %s', message);
            ws.send(message);
        });
    });
    // Upgrade HTTP request to WebSocket connection
    if (!res.writableEnded) {
        res.writeHead(101, {
            'Content-Type': 'text/plain',
            'Connection': 'Upgrade',
            'Upgrade': 'websocket'
        });
        res.end();
    }
    wss.handleUpgrade(req, req.socket, Buffer.alloc(0), function done(ws) {
        wss.emit('connection', ws, req);
    });
}