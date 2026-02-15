const WebSocket = require('ws');
const port = process.env.PORT || 10000;
const wss = new WebSocket.Server({ port });

let rooms = {};

setInterval(() => {
    wss.clients.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'heartbeat' }));
    });
}, 15000);

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        if (data.type === 'join') {
            const roomId = data.token;
            if (!rooms[roomId]) rooms[roomId] = [];
            ws.side = rooms[roomId].length === 0 ? 'A' : 'B';
            ws.roomId = roomId;
            rooms[roomId].push(ws);
            ws.send(JSON.stringify({ type: 'start', side: ws.side }));
            if (rooms[roomId].length === 2) {
                rooms[roomId].forEach(c => c.send(JSON.stringify({ type: 'open_door' })));
            }
        }
        if (ws.roomId && rooms[ws.roomId]) {
            rooms[ws.roomId].forEach(client => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(data));
                }
            });
        }
    });
    ws.on('close', () => {
        if (ws.roomId && rooms[ws.roomId]) {
            rooms[ws.roomId] = rooms[ws.roomId].filter(c => c !== ws);
        }
    });
});