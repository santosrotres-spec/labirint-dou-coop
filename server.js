const WebSocket = require('ws');

// O Render fornece a porta automaticamente
const port = process.env.PORT || 10000;
const wss = new WebSocket.Server({ port });

let players = [];

console.log(`Servidor rodando na porta ${port}`);

wss.on('connection', (ws) => {
    // Lógica para definir os lados
    const side = players.length === 0 ? 'A' : 'B';
    players.push(ws);
    
    // ENVIA O START: Isso faz o jogo sair da tela de carregamento
    ws.send(JSON.stringify({ type: 'start', side: side }));
    console.log(`Jogador ${side} conectado. Total: ${players.length}`);

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            // Repassa movimentos para os outros jogadores
            wss.clients.forEach((client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(data));
                }
            });
        } catch (e) {
            console.log("Erro na mensagem");
        }
    });

    ws.on('close', () => {
        players = players.filter(p => p !== ws);
        console.log("Jogador desconectado");
    });
});