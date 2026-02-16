const WebSocket = require('ws');
const port = process.env.PORT || 10000;
const wss = new WebSocket.Server({ port });
let rooms = {};

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        const roomId = data.token || ws.roomId;

        if (data.type === 'join') {
            if (!rooms[roomId]) rooms[roomId] = { players: [], level: 1, ready: [] };
            ws.roomId = roomId;
            ws.side = rooms[roomId].players.length === 0 ? 'A' : 'B';
            rooms[roomId].players.push(ws);
            ws.send(JSON.stringify({ type: 'start', side: ws.side, level: rooms[roomId].level }));
        }

        if (data.type === 'reached_exit') {
            const room = rooms[roomId];
            if (!room.ready.includes(ws.side)) room.ready.push(ws.side);
            if (room.ready.length === 2) {
                room.level++; room.ready = [];
                room.players.forEach(p => p.send(JSON.stringify({ type: 'next_level', level: room.level })));
            }
        }

        if (data.type === 'move' && rooms[roomId]) {
            rooms[roomId].players.forEach(p => { if (p !== ws) p.send(JSON.stringify(data)); });
        }
    });
    ws.on('close', () => {
        if (ws.roomId && rooms[ws.roomId]) {
            rooms[ws.roomId].players = rooms[ws.roomId].players.filter(p => p !== ws);
        }
    });
});