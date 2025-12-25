// Game state
let gameState = null;
let currentPlayer = null;
let soundTimer = null;
let countdownTimer = null;
let nextSoundTime = null;
let audioElement = null;

// Broadcast channel for real-time sync across devices (same browser)
// Note: For true multi-device support on local WiFi, you'd need a WebSocket server
// For now, we'll use localStorage with periodic polling for simplicity

const STORAGE_KEY = 'grannyGameState';
const PLAYER_KEY = 'grannyCurrentPlayer';

// Initialize
window.addEventListener('load', () => {
    loadGameState();
    startPolling();
    audioElement = document.getElementById('game-audio');
});

// Sound control functions
function updateIntervalMinDisplay() {
    const minValue = parseInt(document.getElementById('sound-interval-min').value);
    const maxValue = parseInt(document.getElementById('sound-interval-max').value);
    
    // Ensure min doesn't exceed max
    if (minValue > maxValue) {
        document.getElementById('sound-interval-max').value = minValue;
        document.getElementById('interval-max-value').textContent = minValue;
    }
    
    document.getElementById('interval-min-value').textContent = minValue;
}

function updateIntervalMaxDisplay() {
    const minValue = parseInt(document.getElementById('sound-interval-min').value);
    const maxValue = parseInt(document.getElementById('sound-interval-max').value);
    
    // Ensure max doesn't go below min
    if (maxValue < minValue) {
        document.getElementById('sound-interval-min').value = maxValue;
        document.getElementById('interval-min-value').textContent = maxValue;
    }
    
    document.getElementById('interval-max-value').textContent = maxValue;
}

function updateVolumeDisplay() {
    const value = document.getElementById('sound-volume').value;
    document.getElementById('volume-value').textContent = value;
}

function testSound() {
    const volume = parseInt(document.getElementById('sound-volume').value) / 100;
    
    // Create a simple creepy tone using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create oscillators for a creepy chord
    const oscillator1 = audioContext.createOscillator();
    const oscillator2 = audioContext.createOscillator();
    const oscillator3 = audioContext.createOscillator();
    
    const gainNode = audioContext.createGain();
    
    // Creepy frequencies (minor second interval)
    oscillator1.frequency.value = 220; // A3
    oscillator2.frequency.value = 233; // A#3 (dissonant)
    oscillator3.frequency.value = 110; // A2 (bass)
    
    oscillator1.type = 'sine';
    oscillator2.type = 'sine';
    oscillator3.type = 'triangle';
    
    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    oscillator3.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Set volume
    gainNode.gain.value = volume * 0.3; // Scale down to avoid being too loud
    
    // Fade in and out
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume * 0.3, audioContext.currentTime + 0.5);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 2.5);
    
    // Play sound
    oscillator1.start(audioContext.currentTime);
    oscillator2.start(audioContext.currentTime);
    oscillator3.start(audioContext.currentTime);
    
    oscillator1.stop(audioContext.currentTime + 3);
    oscillator2.stop(audioContext.currentTime + 3);
    oscillator3.stop(audioContext.currentTime + 3);
}

// Navigation functions
function showWelcome() {
    hideAllScreens();
    document.getElementById('welcome-screen').classList.add('active');
}

function showHostSetup() {
    hideAllScreens();
    document.getElementById('host-setup-screen').classList.add('active');
}

function showJoinGame() {
    hideAllScreens();
    document.getElementById('join-screen').classList.add('active');
}

function showGameScreen() {
    hideAllScreens();
    document.getElementById('game-screen').classList.add('active');
}

function hideAllScreens() {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
}

// Host Setup Functions
function generateLevelInputs() {
    const numLevels = parseInt(document.getElementById('num-levels').value);
    const container = document.getElementById('levels-config');
    container.innerHTML = '';

    for (let i = 1; i <= numLevels; i++) {
        const levelDiv = document.createElement('div');
        levelDiv.className = 'level-config-item';
        levelDiv.innerHTML = `
            <h4>Level ${i}</h4>
            <div class="form-group">
                <label>4-Digit Code</label>
                <input type="number" id="code-${i}" placeholder="e.g., 1234" min="0" max="9999" required>
            </div>
            <div class="form-group">
                <label>Clue</label>
                <textarea id="clue-${i}" placeholder="e.g., Check behind the painting" required></textarea>
            </div>
        `;
        container.appendChild(levelDiv);
    }

    document.getElementById('start-game-btn').style.display = 'block';
}

function startGame() {
    const numLevels = parseInt(document.getElementById('num-levels').value);
    const numLives = parseInt(document.getElementById('num-lives').value);
    const soundIntervalMin = parseInt(document.getElementById('sound-interval-min').value);
    const soundIntervalMax = parseInt(document.getElementById('sound-interval-max').value);
    const soundVolume = parseInt(document.getElementById('sound-volume').value);

    // Collect level data
    const levels = [];
    for (let i = 1; i <= numLevels; i++) {
        const code = document.getElementById(`code-${i}`).value;
        const clue = document.getElementById(`clue-${i}`).value;

        if (!code || !clue) {
            alert(`Please complete all fields for Level ${i}`);
            return;
        }

        // Ensure code is 4 digits
        const paddedCode = code.padStart(4, '0');

        levels.push({
            id: i,
            code: paddedCode,
            clue: clue
        });
    }

    // Generate game code
    const gameCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Initialize game state
    gameState = {
        gameCode: gameCode,
        numLevels: numLevels,
        numLives: numLives,
        levels: levels,
        players: [],
        started: true,
        winner: null,
        soundSettings: {
            intervalMin: soundIntervalMin,
            intervalMax: soundIntervalMax,
            volume: soundVolume
        }
    };

    saveGameState();

    alert(`Game created! Share this code with players: ${gameCode}`);
    
    // Host joins as observer or first player
    const hostName = prompt('Enter your name (or leave blank to observe):');
    if (hostName && hostName.trim()) {
        joinAsPlayer(hostName.trim());
    } else {
        showGameScreen();
        updateGameDisplay();
        startSoundTimer();
    }
}

// Join Game Functions
function joinGame() {
    const gameCode = document.getElementById('game-code-input').value.toUpperCase().trim();
    const playerName = document.getElementById('player-name-input').value.trim();

    if (!gameCode || !playerName) {
        showError('join-error', 'Please enter both game code and name');
        return;
    }

    loadGameState();

    if (!gameState || gameState.gameCode !== gameCode) {
        showError('join-error', 'Invalid game code');
        return;
    }

    joinAsPlayer(playerName);
}

function joinAsPlayer(playerName) {
    // Check if player already exists
    const existingPlayer = gameState.players.find(p => p.name === playerName);
    
    if (existingPlayer) {
        currentPlayer = existingPlayer;
    } else {
        // Create new player
        currentPlayer = {
            id: Date.now().toString(),
            name: playerName,
            lives: gameState.numLives,
            completedLevels: [],
            eliminated: false
        };
        gameState.players.push(currentPlayer);
        saveGameState();
    }

    localStorage.setItem(PLAYER_KEY, JSON.stringify(currentPlayer));
    showGameScreen();
    updateGameDisplay();
    startSoundTimer();
}

// Game Functions
function submitCode() {
    const codeInput = document.getElementById('code-input').value.trim();
    
    if (codeInput.length !== 4) {
        showFeedback('Enter a 4-digit code', 'error');
        return;
    }

    const paddedCode = codeInput.padStart(4, '0');

    // Check if code matches any incomplete level
    const matchingLevel = gameState.levels.find(level => 
        level.code === paddedCode && !currentPlayer.completedLevels.includes(level.id)
    );

    if (matchingLevel) {
        currentPlayer.completedLevels.push(matchingLevel.id);
        updatePlayerInGameState();
        saveGameState();
        
        showFeedback(`Level ${matchingLevel.id} completed! ✅`, 'success');
        document.getElementById('code-input').value = '';
        
        // Check for win
        if (currentPlayer.completedLevels.length === gameState.numLevels) {
            if (!gameState.winner) {
                gameState.winner = currentPlayer.name;
                saveGameState();
            }
        }
        
        updateGameDisplay();
    } else {
        showFeedback('Incorrect code ❌', 'error');
        setTimeout(() => {
            document.getElementById('code-feedback').innerHTML = '';
        }, 2000);
    }
}

function playerCaught() {
    if (currentPlayer.eliminated) {
        return;
    }

    currentPlayer.lives--;
    
    if (currentPlayer.lives <= 0) {
        currentPlayer.eliminated = true;
        alert('You have been eliminated! 💀');
    } else {
        // Flash effect
        document.body.style.background = '#ff0000';
        setTimeout(() => {
            document.body.style.background = '';
        }, 200);
    }

    updatePlayerInGameState();
    saveGameState();
    updateGameDisplay();
}

// Display Functions
function updateGameDisplay() {
    if (!currentPlayer) {
        updateLeaderboardOnly();
        return;
    }

    // Update player name
    document.getElementById('player-name-display').textContent = currentPlayer.name;

    // Update lives
    const livesDisplay = document.getElementById('lives-display');
    let livesHTML = '';
    for (let i = 0; i < gameState.numLives; i++) {
        if (i < currentPlayer.lives) {
            livesHTML += '❤️';
        } else {
            livesHTML += '🖤';
        }
    }
    livesDisplay.innerHTML = livesHTML;

    // Update progress
    const progressBar = document.getElementById('player-progress');
    let progressHTML = '';
    for (let i = 1; i <= gameState.numLevels; i++) {
        const completed = currentPlayer.completedLevels.includes(i);
        progressHTML += `<div class="progress-item ${completed ? 'completed' : ''}">
            ${completed ? '✅' : i}
        </div>`;
    }
    progressBar.innerHTML = progressHTML;

    // Update clues (only incomplete levels)
    const cluesList = document.getElementById('clues-list');
    const incompleteLevels = gameState.levels.filter(level => 
        !currentPlayer.completedLevels.includes(level.id)
    );

    if (incompleteLevels.length === 0) {
        cluesList.innerHTML = '<div class="empty-state">All levels completed! 🎉</div>';
    } else {
        let cluesHTML = '';
        incompleteLevels.forEach(level => {
            cluesHTML += `
                <div class="clue-item">
                    <div class="clue-label">Level ${level.id}</div>
                    <div class="clue-text">${level.clue}</div>
                </div>
            `;
        });
        cluesList.innerHTML = cluesHTML;
    }

    // Update leaderboard
    updateLeaderboardOnly();

    // Check game over conditions
    updateGameOverStatus();
}

function updateLeaderboardOnly() {
    const leaderboard = document.getElementById('leaderboard');
    
    if (!gameState || gameState.players.length === 0) {
        leaderboard.innerHTML = '<div class="empty-state">No players yet</div>';
        return;
    }

    // Sort players by completion, then by lives
    const sortedPlayers = [...gameState.players].sort((a, b) => {
        if (a.completedLevels.length !== b.completedLevels.length) {
            return b.completedLevels.length - a.completedLevels.length;
        }
        return b.lives - a.lives;
    });

    let leaderboardHTML = '';
    sortedPlayers.forEach(player => {
        const isWinner = gameState.winner === player.name;
        const itemClass = player.eliminated ? 'eliminated' : (isWinner ? 'winner' : '');
        
        let livesHTML = '';
        for (let i = 0; i < player.lives; i++) {
            livesHTML += '❤️';
        }

        let progressHTML = '';
        for (let i = 0; i < player.completedLevels.length; i++) {
            progressHTML += '✅';
        }

        leaderboardHTML += `
            <div class="leaderboard-item ${itemClass}">
                <div class="player-info">
                    <div class="player-name">${player.name} ${isWinner ? '👑' : ''} ${player.eliminated ? '💀' : ''}</div>
                    <div class="player-stats">
                        <span>${livesHTML || '💀'}</span>
                        <span>${progressHTML} ${player.completedLevels.length}/${gameState.numLevels}</span>
                    </div>
                </div>
            </div>
        `;
    });

    leaderboard.innerHTML = leaderboardHTML;
}

function updateGameOverStatus() {
    const gameOverDiv = document.getElementById('game-over-message');
    
    if (gameState.winner) {
        gameOverDiv.innerHTML = `🎉 ${gameState.winner} WINS! 🎉`;
        gameOverDiv.classList.add('show');
    } else {
        const allEliminated = gameState.players.every(p => p.eliminated);
        if (allEliminated && gameState.players.length > 0) {
            gameOverDiv.innerHTML = `💀 Everyone was caught! Granny wins! 💀`;
            gameOverDiv.classList.add('show');
        }
    }
}

// Helper Functions
function showFeedback(message, type) {
    const feedback = document.getElementById('code-feedback');
    feedback.textContent = message;
    feedback.className = `feedback-message ${type}`;
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    setTimeout(() => {
        errorElement.textContent = '';
    }, 3000);
}

function updatePlayerInGameState() {
    const index = gameState.players.findIndex(p => p.id === currentPlayer.id);
    if (index !== -1) {
        gameState.players[index] = currentPlayer;
    }
}

// Storage Functions
function saveGameState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
}

function loadGameState() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        gameState = JSON.parse(stored);
    }

    const storedPlayer = localStorage.getItem(PLAYER_KEY);
    if (storedPlayer) {
        const playerData = JSON.parse(storedPlayer);
        // Find current player in game state
        if (gameState) {
            currentPlayer = gameState.players.find(p => p.id === playerData.id);
        }
    }
}

// Polling for updates (simulates real-time sync)
function startPolling() {
    setInterval(() => {
        const oldState = gameState;
        loadGameState();
        
        // Only update display if we're on the game screen and state changed
        if (document.getElementById('game-screen').classList.contains('active')) {
            if (JSON.stringify(oldState) !== JSON.stringify(gameState)) {
                updateGameDisplay();
            }
        }
    }, 1000); // Poll every second
}

// Sound timer functions
function startSoundTimer() {
    if (!gameState || !gameState.soundSettings) return;
    
    // Clear any existing timers
    if (soundTimer) clearInterval(soundTimer);
    if (countdownTimer) clearInterval(countdownTimer);
    
    // Set initial next sound time
    scheduleNextSound();
    
    // Start countdown display
    countdownTimer = setInterval(updateCountdown, 1000);
}

function scheduleNextSound() {
    if (!gameState || !gameState.soundSettings) return;
    
    const settings = gameState.soundSettings;
    
    // Calculate random interval between min and max
    const minMs = settings.intervalMin * 1000;
    const maxMs = settings.intervalMax * 1000;
    const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
    
    nextSoundTime = Date.now() + delay;
    
    // Clear existing timer
    if (soundTimer) clearTimeout(soundTimer);
    
    // Schedule sound
    soundTimer = setTimeout(() => {
        playCreepySound();
        scheduleNextSound(); // Schedule next sound
    }, delay);
}

function updateCountdown() {
    if (!nextSoundTime) return;
    
    const remaining = Math.max(0, Math.ceil((nextSoundTime - Date.now()) / 1000));
    const countdownElement = document.getElementById('countdown');
    
    if (countdownElement) {
        countdownElement.textContent = remaining;
    }
}

function playCreepySound() {
    if (!gameState || !gameState.soundSettings || !audioElement) return;
    
    const volume = gameState.soundSettings.volume / 100;
    
    // Create a simple creepy tone using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create oscillators for a creepy chord
    const oscillator1 = audioContext.createOscillator();
    const oscillator2 = audioContext.createOscillator();
    const oscillator3 = audioContext.createOscillator();
    
    const gainNode = audioContext.createGain();
    
    // Creepy frequencies (minor second interval)
    oscillator1.frequency.value = 220; // A3
    oscillator2.frequency.value = 233; // A#3 (dissonant)
    oscillator3.frequency.value = 110; // A2 (bass)
    
    oscillator1.type = 'sine';
    oscillator2.type = 'sine';
    oscillator3.type = 'triangle';
    
    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    oscillator3.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Set volume
    gainNode.gain.value = volume * 0.3; // Scale down to avoid being too loud
    
    // Fade in and out
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume * 0.3, audioContext.currentTime + 0.5);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 2.5);
    
    // Play sound
    oscillator1.start(audioContext.currentTime);
    oscillator2.start(audioContext.currentTime);
    oscillator3.start(audioContext.currentTime);
    
    oscillator1.stop(audioContext.currentTime + 3);
    oscillator2.stop(audioContext.currentTime + 3);
    oscillator3.stop(audioContext.currentTime + 3);
    
    // Visual feedback
    const countdownElement = document.getElementById('countdown');
    if (countdownElement) {
        const originalText = countdownElement.textContent;
        countdownElement.textContent = '🔊';
        countdownElement.style.color = '#ff0000';
        
        setTimeout(() => {
            countdownElement.style.color = '';
        }, 3000);
    }
}

// Allow enter key to submit code
document.addEventListener('DOMContentLoaded', () => {
    const codeInput = document.getElementById('code-input');
    if (codeInput) {
        codeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                submitCode();
            }
        });
    }
});
