const socket = io();

socket.on('updateItems', (items) => {
    document.getElementById('item-list').innerHTML = items.map(item => `<li>${item}</li>`).join('');
});

socket.on('updatePlayers', (players) => {
    document.getElementById('player-list').innerHTML = players.map(player => `<li>${player.name}</li>`).join('');
});

function addItem() {
    const item = document.getElementById('item-input').value.trim();
    if (item) {
        socket.emit('addItem', item);
        document.getElementById('item-input').value = '';
    }
}



// Begriffe zurücksetzen (an den Server senden)
function resetItems() {
    socket.emit('resetItems');
}

// Event-Listener für den Reset-Button
document.getElementById('reset-items').addEventListener('click', resetItems);



function addPlayer() {
    const player = document.getElementById('player-input').value.trim();
    if (player) {
        socket.emit('addPlayer', player);
        document.getElementById('player-input').value = '';
    }
}

function startGame() {
    socket.emit('startGame');
}

socket.on('gameResult', (data) => {
    alert(`Deine Rolle: ${data.role}`);
});

socket.on('gameStarted', () => {
    alert('Das Spiel hat begonnen!');
});


// Neues Spiel starten (an den Server senden)
function resetGame() {
    socket.emit('resetGame');
}
// DOMContentLoaded-Event-Listener hinzufügen
document.addEventListener('DOMContentLoaded', () => {
    const resetButton = document.getElementById('reset-game');
    if (resetButton) {
        resetButton.addEventListener('click', resetGame);
    } else {
        console.error('Button "Neues Spiel starten" nicht gefunden!');
    }
});


// Spielfeld zurücksetzen, wenn vom Server ausgelöst
socket.on('gameReset', () => {
    document.getElementById('item-list').innerHTML = '';
    document.getElementById('player-list').innerHTML = '';
    document.getElementById('setup').style.display = 'block';
    document.getElementById('players').style.display = 'none';
    document.getElementById('result').style.display = 'none';
});

// Event-Listener für "Neues Spiel starten"
document.getElementById('reset-game').addEventListener('click', resetGame);
