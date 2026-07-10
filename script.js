// Variables d'état du jeu
let totalPlayers = 1;
let currentPlayer = 1;
let currentDart = 1;

// Sélection des éléments dans le HTML
const playerButtons = document.querySelectorAll('.btn-player');
const startGameBtn = document.getElementById('start-game-btn');
const scoreButtons = document.querySelectorAll('.btn-score');
const currentPlayerDisplay = document.getElementById('current-player-display');
const dartCountDisplay = document.getElementById('dart-count');
const statsContainer = document.getElementById('stats-container');

// 1. Gérer le choix du nombre de joueurs (sélection des boutons)
playerButtons.forEach(button => {
    button.addEventListener('click', () => {
        playerButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        totalPlayers = parseInt(button.getAttribute('data-players'));
    });
});

// 2. Lancer la partie
if (startGameBtn) {
    startGameBtn.addEventListener('click', () => {
        currentPlayer = 1;
        currentDart = 1;
        updateDisplay();
        if (statsContainer) {
            statsContainer.innerHTML = `<p>Partie lancée avec ${totalPlayers} joueur(s) !</p>`;
        }
    });
}

// 3. CORRECTION : Gérer le clic sur CHAQUE bouton de score
scoreButtons.forEach(button => {
    button.addEventListener('click', () => {
        const points = button.getAttribute('data-points');
        
        // Logique des 3 fléchettes
        if (currentDart < 3) {
            currentDart++;
        } else {
            currentDart = 1;
            if (currentPlayer < totalPlayers) {
                currentPlayer++;
            } else {
                currentPlayer = 1; // On revient au joueur 1
            }
        }
        
        updateDisplay();
        
        if (statsContainer) {
            statsContainer.innerHTML = `<p>Dernier lancer : <strong>${points} pts</strong></p>`;
        }
    });
});

// Fonction pour mettre à jour l'affichage
function updateDisplay() {
    if (currentPlayerDisplay) currentPlayerDisplay.textContent = `Joueur ${currentPlayer}`;
    if (dartCountDisplay) dartCountDisplay.textContent = currentDart;
}
