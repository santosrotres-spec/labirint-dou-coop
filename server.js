const WebSocket = require('ws');
const port = process.env.PORT || 3000;
const wss = new WebSocket.Server({ port });

let rooms = {};

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const d = JSON.parse(message);

        if (d.type === 'join') {
            const token = d.token;
            if (!rooms[token]) rooms[token] = { players: [], sides: ['A', 'B'] };

            if (rooms[token].players.length < 2) {
                const side = rooms[token].sides.shift();
                ws.side = side;
                ws.token = token;
                rooms[token].players.push(ws);
                ws.send(JSON.stringify({ type: 'start', side }));
                console.log(`${d.nick} entrou como ${side} na sala ${token}`);
            }
        }

        if (d.type === 'move' && ws.token) {
            rooms[ws.token].players.forEach(p => {
                if (p !== ws) p.send(JSON.stringify(d));
            });
        }
    });

    ws.on('close', () => {
        if (ws.token && rooms[ws.token]) {
            rooms[ws.token].players = rooms[ws.token].players.filter(p => p !== ws);
            rooms[ws.token].sides.push(ws.side);
            if (rooms[ws.token].players.length === 0) delete rooms[ws.token];
        }
    });
});

console.log(`Servidor iniciado na porta ${port}`);