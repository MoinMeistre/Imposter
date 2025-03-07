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
