// Variables d'état du jeu
let totalPlayers = 1;
let currentPlayer = 1;
let currentDart = 1;

// Éléments du DOM
const playerButtons = document.querySelectorAll('.btn-player');
const startGameBtn = document.getElementById('start-game-btn');
const scoreButtons = document.querySelectorAll('.btn-score');
const currentPlayerDisplay = document.getElementById('current-player-display');
const dartCountDisplay = document.getElementById('dart-count');
const statsContainer = document.getElementById('stats-container');

// Gestion du choix du nombre de joueurs
playerButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Enlever la classe active de tous les boutons
        playerButtons.forEach(btn => btn.classList.remove('active'));
        // Ajouter la classe au bouton cliqué
        button.classList.add('active');
        // Mettre à jour la variable
        totalPlayers = parseInt(button.getAttribute('data-players'));
    });
});

// Lancement de la partie
startGameBtn.addEventListener('click', () => {
    currentPlayer = 1;
    currentDart = 1;
    updateDisplay();
    statsContainer.innerHTML = `<p>Partie lancée avec ${totalPlayers} joueur(s) ! Prêt à marquer.</p>`;
    // Optionnel : faire défiler jusqu'à la zone de jeu sur mobile
    document.getElementById('game-screen').scrollIntoView({ behavior: 'smooth' });
});

// Gestion des tirs (clic sur un score)
scoreButtons.forEach(button => {
    button.addEventListener('click', () => {
        const points = button.getAttribute('data-points');
        
        // Logique de changement de fléchette et de joueur
        if (currentDart < 3) {
            currentDart++;
        } else {
            currentDart = 1;
            if (currentPlayer < totalPlayers) {
                currentPlayer++;
            } else {
                currentPlayer = 1; // Retour au joueur 1
            }
        }
        
        updateDisplay();
        
        // Affiche temporairement le dernier coup dans les stats
        statsContainer.innerHTML = `<p>Joueur ${currentPlayer} a visé la zone : <strong>${points}</strong></p>`;
    });
});

// Mise à jour des textes à l'écran
function updateDisplay() {
    currentPlayerDisplay.textContent = `Joueur ${currentPlayer}`;
    dartCountDisplay.textContent = currentDart;
}
