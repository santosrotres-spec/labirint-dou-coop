// Adicione isso no topo do script
let goalReached = false;

// Dentro do init3D, adicione o bloco de chegada
const goalGeo = new THREE.BoxGeometry(2, 0.5, 2);
const goalMat = new THREE.MeshStandardMaterial({ color: 0x00ff00, emissive: 0x00ff00 });
const goal = new THREE.Mesh(goalGeo, goalMat);
// Coloca a chegada no final do labirinto (canto oposto)
goal.position.set((mazeSize - 2) * 2 - mazeSize, 0.1, (mazeSize - 2) * 2 - mazeSize);
scene.add(goal);

// Dentro do animate, verifique a vitória
function animate() {
    requestAnimationFrame(animate);
    if (!side || goalReached) return;

    // ... (seu código de movimento atual)

    // Lógica de Vitória
    if (p.position.distanceTo(goal.position) < 1.5) {
        goalReached = true;
        alert("PARABÉNS! Você completou o labirinto!");
        location.reload(); // Reinicia o jogo
    }
}