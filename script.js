// --- DADOS DOS 10 JOGOS ---
const jogos = [
    { id: 1, nome: "Corrida de Pets", icone: "fa-paw", cor: "#facc15" },
    { id: 2, nome: "Guerra de Balões", icone: "fa-fly", cor: "#f43f5e" },
    { id: 3, nome: "Defesa do Castelo", icone: "fa-chess-rook", cor: "#94a3b8" },
    { id: 4, nome: "Chuva de Meteoros", icone: "fa-meteor", cor: "#c084fc" },
    { id: 5, nome: "Pulo do Ninja", icone: "fa-user-ninja", cor: "#000000" },
    { id: 6, nome: "Invasão Zumbi", icone: "fa-skull", cor: "#22c55e" },
    { id: 7, nome: "Batalha Naval", icone: "fa-ship", cor: "#3b82f6" },
    { id: 8, nome: "Mundo de Blocos", icone: "fa-cubes", cor: "#8b5cf6" },
    { id: 9, nome: "Fuga Espacial", icone: "fa-rocket", cor: "#eab308" },
    { id: 10, nome: "Duelo Mágico", icone: "fa-wand-magic-sparkles", cor: "#ec4899" }
];

let jogoAtual = null;
let animacaoFrame;
let entidades = [];

// --- SISTEMA DE NAVEGAÇÃO E TIKTOK ---
function mudarTela(telaId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(telaId).classList.add('active');
}

function conectarTikTok() {
    const nick = document.getElementById('tiktok-nick').value.trim();
    if (!nick) {
        document.getElementById('login-status').innerText = "Digite um @ válido!";
        return;
    }
    
    // Atualiza interface do Dashboard
    document.getElementById('display-nick').innerText = "@" + nick;
    // Truque: usa a API unavatar para tentar pegar a foto de perfil do TikTok
    document.getElementById('profile-pic').src = `https://unavatar.io/tiktok/${nick.replace('@', '')}?fallback=https://api.dicebear.com/7.x/avataaars/svg?seed=${nick}`;
    
    gerarMenuJogos();
    mudarTela('dashboard-screen');
}

function desconectar() {
    document.getElementById('tiktok-nick').value = '';
    mudarTela('login-screen');
}

function gerarMenuJogos() {
    const grid = document.getElementById('games-grid');
    grid.innerHTML = '';
    jogos.forEach(jogo => {
        const div = document.createElement('div');
        div.className = 'game-card';
        div.onclick = () => iniciarJogo(jogo);
        div.innerHTML = `
            <i class="fas ${jogo.icone}" style="color: ${jogo.cor}"></i>
            <h4>${jogo.nome}</h4>
        `;
        grid.appendChild(div);
    });
}

// --- ENGINE DOS JOGOS (CANVAS) ---
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

function redimensionarCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', redimensionarCanvas);
redimensionarCanvas();

function iniciarJogo(jogo) {
    jogoAtual = jogo;
    document.getElementById('current-game-title').innerText = jogo.nome;
    mudarTela('game-screen');
    entidades = []; // Limpa o mapa
    
    // Inicia o loop de animação
    if (animacaoFrame) cancelAnimationFrame(animacaoFrame);
    loopJogo();
}

function voltarDashboard() {
    if (animacaoFrame) cancelAnimationFrame(animacaoFrame);
    jogoAtual = null;
    mudarTela('dashboard-screen');
}

function loopJogo() {
    // Desenha o fundo baseado no jogo
    ctx.fillStyle = jogoAtual.id % 2 === 0 ? '#1a1a2e' : '#16213e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Desenha um chão
    ctx.fillStyle = jogoAtual.cor;
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);

    // Atualiza e desenha entidades (os efeitos dos presentes)
    for (let i = entidades.length - 1; i >= 0; i--) {
        let ent = entidades[i];
        
        // Física simples
        ent.y += ent.vy;
        ent.x += ent.vx;
        
        // Desenha a entidade (emoji ou quadrado)
        ctx.font = `${ent.tamanho}px Arial`;
        ctx.fillText(ent.emoji, ent.x, ent.y);
        
        // Remove se sair da tela ou ficar muito tempo
        ent.vida--;
        if (ent.y > canvas.height || ent.vida <= 0) {
            entidades.splice(i, 1);
        }
    }

    animacaoFrame = requestAnimationFrame(loopJogo);
}

// --- EVENTOS (OS 4 PRESENTES CONFIGURÁVEIS) ---
function simularPresente(tipoPresente) {
    if (!jogoAtual) return;

    let novaEntidade = {
        x: Math.random() * (canvas.width - 100) + 50,
        y: canvas.height / 2, // Nasce no meio
        vx: (Math.random() - 0.5) * 10,
        vy: -5,
        tamanho: 40,
        vida: 200, // Frames de vida
        emoji: '🎁'
    };

    // 4 Eventos diferentes dependendo do presente recebido
    if (tipoPresente === 'Rosa') {
        novaEntidade.emoji = '🌹';
        novaEntidade.vy = -2; // Flutua pra cima
        novaEntidade.tamanho = 30;
    } 
    else if (tipoPresente === 'Sorvete') {
        novaEntidade.emoji = '💣'; // Simula um ataque caindo
        novaEntidade.y = 50; // Nasce no topo
        novaEntidade.vy = 8; // Cai rápido
        novaEntidade.vx = 0;
    } 
    else if (tipoPresente === 'Coração') {
        novaEntidade.emoji = '🛡️'; // Escudo/Cura
        novaEntidade.vy = 0;
        novaEntidade.vx = 2; // Anda pro lado
        novaEntidade.tamanho = 60;
    } 
    else if (tipoPresente === 'Leão') {
        // Evento Épico: Chove moedas/estrelas
        for(let i=0; i<30; i++) {
            entidades.push({
                x: canvas.width / 2,
                y: canvas.height / 2,
                vx: (Math.random() - 0.5) * 20,
                vy: (Math.random() - 0.5) * 20,
                tamanho: Math.random() * 30 + 20,
                vida: 100,
                emoji: '✨'
            });
        }
        return; // Não adiciona a entidade base, já gerou a explosão
    }

    entidades.push(novaEntidade);
}
