const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

// Initialisiere den Express-Server
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Spiel-Daten speichern
let players = [];
let items = [];
let gameStarted = false;

// Statische Dateien bereitstellen (deine Website)
app.use(express.static('public'));

// WebSocket-Verbindung
io.on('connection', (socket) => {
    console.log('Ein Spieler hat sich verbunden:', socket.id);

    // Spieler hinzufügen
    socket.on('addPlayer', (playerName) => {
        if (!gameStarted) {
            players.push({ id: socket.id, name: playerName });
            io.emit('updatePlayers', players); // Allen Spielern mitteilen
        }
    });

    // Begriffe hinzufügen
    socket.on('addItem', (item) => {
        if (!gameStarted) {
            items.push(item);
            io.emit('updateItems', items); // Begriffe synchronisieren
        }
    });

    // Spiel starten
    socket.on('startGame', () => {
        if (players.length >= 3 && items.length >= 1) {
            gameStarted = true;
            const imposterIndex = Math.floor(Math.random() * players.length);
            const word = items[Math.floor(Math.random() * items.length)];

            players.forEach((player, index) => {
                io.to(player.id).emit('gameResult', {
                    role: index === imposterIndex ? 'Imposter' : word,
                });
            });

            io.emit('gameStarted');
        } else {
            socket.emit('errorMessage', 'Mindestens 3 Spieler und 1 Begriff erforderlich!');
        }
    });

    // Spieler trennen
    socket.on('disconnect', () => {
        players = players.filter((player) => player.id !== socket.id);
        io.emit('updatePlayers', players); // Aktualisierte Spieler-Liste
    });
});

// Server starten
server.listen(3000, () => {
    console.log('Server läuft auf http://localhost:3000');
});
