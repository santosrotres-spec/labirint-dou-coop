const WebSocket = require('ws');

// O Render define a porta automaticamente, por isso usamos process.env.PORT
const port = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port });

console.log(`Servidor iniciado na porta ${port}`);

wss.on('connection', (ws) => {
    console.log('Novo jogador conectado');

    ws.on('message', (message) => {
        // Envia a posição de um jogador para todos os outros
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message.toString());
            }
        });
    });

    ws.on('close', () => console.log('Jogador desconectou'));
});