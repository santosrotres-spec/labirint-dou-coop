const WebSocket = require('ws');
const port = process.env.PORT || 10000;
const wss = new WebSocket.Server({ port });

let rooms = {};

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.type === 'join') {
            const roomId = data.token;
            if (!rooms[roomId]) rooms[roomId] = [];
            
            const side = rooms[roomId].length === 0 ? 'A' : 'B';
            ws.side = side;
            ws.roomId = roomId;
            rooms[roomId].push(ws);

            // Envia para quem entrou o seu lado e confirmação
            ws.send(JSON.stringify({ type: 'start', side: side }));
        }

        // Repassa TUDO (movimento, rosto, chapéu) para os outros na sala
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