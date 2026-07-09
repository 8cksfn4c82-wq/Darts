// --- ÉTAT DU JEU ---
let gameState = {
    players: [],
    activePlayerIndex: 0,
    currentDart: 1,
    numbers: [], // Contient les numéros choisis + 'BULL'
    history: [], // Pile pour l'annulation
    isOver: false,
    dateStarted: null
};

let currentModifier = 1; // 1 = Simple, 2 = Double, 3 = Triple
let stats = JSON.parse(localStorage.getItem('cricket_stats')) || {
    gamesPlayed: 0, wins: 0, triples: 0, totalBulls: 0, totalMisses: 0
};

// --- INITIALISATION AU CHARGEMENT ---
window.onload = function() {
    updatePlayerInputs();
    checkActiveGame();
};

function checkActiveGame() {
    const saved = localStorage.getItem('cricket_current_game');
    if (saved) {
        document.getElementById('btn-resume-game').disabled = false;
    }
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
}

function updatePlayerInputs() {
    const count = parseInt(document.getElementById('nb-players').value);
    const container = document.getElementById('player-names-container');
    container.innerHTML = '';
    for (let i = 1; i <= count; i++) {
        container.innerHTML += `
            <div class="input-player">
                <input type="text" id="p-name-${i}" value="Joueur ${i}" autocomplete="off">
            </div>
        `;
    }
}

// --- LOGIQUE DE GÉNÉRATION DES NUMÉROS ---
function function generateCricketNumbers() {
    let pool = Array.from({length: 11}, (_, i) => i + 10); // [10, 11, ..., 20]
    let shuffled = pool.sort(() => 0.5 - Math.random());
    let selected = shuffled.slice(0, 5); // Prend 5 numéros uniques au hasard
    
    // TRI PAR ORDRE DÉCROISSANT (du plus grand au plus petit)
    selected.sort((a, b) => b - a);
    
    selected.push('BULL'); // Le Bull est ajouté tout en bas
    return selected;
}
}

// --- INITIALISATION DE LA PARTIE ---
function startGame() {
    const count = parseInt(document.getElementById('nb-players').value);
    gameState.players = [];
    gameState.numbers = generateCricketNumbers();
    gameState.activePlayerIndex = 0;
    gameState.currentDart = 1;
    gameState.history = [];
    gameState.isOver = false;
    gameState.dateStarted = new Date().toISOString();

    for (let i = 1; i <= count; i++) {
        let name = document.getElementById(`p-name-${i}`).value.trim() || `Joueur ${i}`;
        let playerMarks = {};
        gameState.numbers.forEach(n => playerMarks[n] = 0);
        
        gameState.players.push({
            name: name,
            score: 0,
            marks: playerMarks
        });
    }

    saveGame();
    renderGameBoard();
    showScreen('screen-game');
}

function resumeGame() {
    const saved = localStorage.getItem('cricket_current_game');
    if (saved) {
        gameState = JSON.parse(saved);
        renderGameBoard();
        showScreen('screen-game');
    }
}

function saveGame() {
    localStorage.setItem('cricket_current_game', JSON.stringify(gameState));
    localStorage.setItem('cricket_stats', JSON.stringify(stats));
    checkActiveGame();
}

// --- ALGORITHME DE SCORE OFFICIEL ---
function applyHit(player, number, value) {
    const current = player.marks[number];
    const total = current + value;

    if (total <= 3) {
        player.marks[number] = total;
        return;
    }

    player.marks[number] = 3;
    const extra = total - 3;

    // Utilisation de gameState.players conformément au cahier des charges
    const othersOpen = gameState.players.some(p => p !== player && p.marks[number] < 3);

    if (othersOpen) {
        const points = number === 'BULL' ? 25 : Number(number);
        player.score += extra * points;
    }
}

// --- SAISIE ET ENREGISTREMENT D'UN LANCER ---
function setModifier(mod) {
    currentModifier = mod;
    document.querySelectorAll('.modifier-row button').forEach(b => b.classList.remove('active'));
    if(mod === 1) document.getElementById('mod-single').classList.add('active');
    if(mod === 2) document.getElementById('mod-double').classList.add('active');
    if(mod === 3) document.getElementById('mod-triple').classList.add('active');
}

function triggerHit(number) {
    if (gameState.isOver) return;
    if (number === 'BULL' && currentModifier === 3) return; // Triple Bull interdit

    // Sauvegarde de l'état pour l'annulation (Deep Copy)
    gameState.history.push(JSON.stringify(gameState));
    if (gameState.history.length > 1) gameState.history.shift(); // Sécurité : Seul le dernier lancer

    let player = gameState.players[gameState.activePlayerIndex];
    
    // Stats
    if (currentModifier === 3) stats.triples++;
    if (number === 'BULL') stats.totalBulls += currentModifier;

    applyHit(player, number, currentModifier);
    advanceDart();
}

function hitMiss() {
    if (gameState.isOver) return;
    gameState.history.push(JSON.stringify(gameState));
    if (gameState.history.length > 1) gameState.history.shift();
    
    stats.totalMisses++;
    advanceDart();
}

function advanceDart() {
    checkVictory();
    
    if (gameState.isOver) {
        endGame();
        return;
    }

    if (gameState.currentDart < 3) {
        gameState.currentDart++;
    } else {
        // Changement de joueur à la fin des 3 fléchettes
        gameState.currentDart = 1;
        gameState.activePlayerIndex = (gameState.activePlayerIndex + 1) % gameState.players.length;
        if(navigator.vibrate) navigator.vibrate(50); // Retour haptique léger
    }

    setModifier(1); // Reset à Simple par défaut
    saveGame();
    renderGameBoard();
}

function undoLastAction() {
    if (gameState.history.length === 0) return;
    gameState = JSON.parse(gameState.history.pop());
    saveGame();
    renderGameBoard();
}

// --- VÉRIFICATION DE LA VICTOIRE ---
function checkVictory() {
    let player = gameState.players[gameState.activePlayerIndex];
    
    // 1. Tous les numéros doivent être fermés (valeur = 3)
    let allClosed = gameState.numbers.every(n => player.marks[n] === 3);
    
    // 2. Le score doit être >= à tous les autres joueurs
    let highestScore = gameState.players.every(p => player.score >= p.score);

    if (allClosed && highestScore) {
        gameState.isOver = true;
    }
}

function endGame() {
    stats.gamesPlayed++;
    stats.wins++; // Mode simplifié : incrémente global
    localStorage.removeItem('cricket_current_game');
    saveGame();
    alert(`Victoire de ${gameState.players[gameState.activePlayerIndex].name} !`);
    showScreen('screen-home');
}

// --- INTERFACE DE JEU DYNAMIQUE (SCOREBOARD) ---
function renderGameBoard() {
    let activePlayer = gameState.players[gameState.activePlayerIndex];
    document.getElementById('active-player-name').innerText = activePlayer.name;
    document.getElementById('current-dart').innerText = gameState.currentDart;

    // Génération du tableau des scores
    let container = document.getElementById('scoreboard-container');
    let html = `<table><tr><th>Cibles</th>`;
    
    gameState.players.forEach(p => {
        html += `<th>${p.name}<br><span class="score-display">${p.score} pts</span></th>`;
    });
    html += `</tr>`;

    gameState.numbers.forEach(num => {
        html += `<tr><td class="num-target">${num}</td>`;
        gameState.players.forEach(p => {
            let symbol = '○ ○ ○';
            if (p.marks[num] === 1) symbol = '● ○ ○';
            if (p.marks[num] === 2) symbol = '● ● ○';
            if (p.marks[num] === 3) symbol = '● ● ●';
            html += `<td class="marks-cell">${symbol}</td>`;
        });
        html += `</tr>`;
    });
    html += `</table>`;
    container.innerHTML = html;

    // Clavier dynamique des touches cibles
    let grid = document.getElementById('targets-grid');
    grid.innerHTML = '';
    gameState.numbers.forEach(num => {
        grid.innerHTML += `<button onclick="triggerHit('${num}')">${num}</button>`;
    });
}

function showStats() {
    let content = document.getElementById('stats-content');
    content.innerHTML = `
        <p>Parties Jouées : <strong>${stats.gamesPlayed}</strong></p>
        <p>Victoires totales : <strong>${stats.wins}</strong></p>
        <p>Triples touchés : <strong>${stats.triples}</strong></p>
        <p>Bulls touchés : <strong>${stats.totalBulls}</strong></p>
        <p>Nombre de Miss : <strong>${stats.totalMisses}</strong></p>
    `;
    showScreen('screen-stats');
}
