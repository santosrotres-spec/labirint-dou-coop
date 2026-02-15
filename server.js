const WebSocket = require('ws');
const port = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port });

// Guarda quem está em cada sala
const rooms = {};

console.log(`Servidor rodando na porta ${port}`);

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const data = JSON.parse(message);

        // LÓGICA DE ENTRAR NA SALA
        if (data.type === 'join') {
            const roomId = data.token;
            if (!rooms[roomId]) rooms[roomId] = [];
            
            // Define se o jogador é A ou B
            const side = rooms[roomId].length === 0 ? 'A' : 'B';
            rooms[roomId].push(ws);
            ws.roomId = roomId;
            ws.side = side;

            // Manda o sinal de START para o jogo sair do "Conectando"
            ws.send(JSON.stringify({ type: 'start', side: side }));
            console.log(`Jogador ${side} entrou na sala ${roomId}`);
        }

        // REPASSA O MOVIMENTO
        if (data.type === 'move') {
            const roomId = ws.roomId;
            if (rooms[roomId]) {
                rooms[roomId].forEach((client) => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(data));
                    }
                });
            }
        }
    });

    ws.on('close', () => {
        if (ws.roomId && rooms[ws.roomId]) {
            rooms[ws.roomId] = rooms[ws.roomId].filter(c => c !== ws);
        }
    });
});