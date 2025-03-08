const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs'); // <-- Neu für Dateispeicherung

// Initialisiere den Express-Server
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Spiel-Daten speichern
let players = [];
let gameStarted = false;

// Begriffe aus Datei laden (oder leere Liste, wenn Datei fehlt)
const itemsFile = './public/items.json';
let items = fs.existsSync(itemsFile) ? JSON.parse(fs.readFileSync(itemsFile)) : [];

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

    // Begriffe hinzufügen und in Datei speichern
    socket.on('addItem', (item) => {
        if (!gameStarted) {
            items.push(item);
            fs.writeFileSync(itemsFile, JSON.stringify(items)); // Begriffe speichern
            io.emit('updateItems', items); // Begriffe synchronisieren
        }
    });

    // Begriffe zurücksetzen (löschen)
    socket.on('resetItems', () => {
        items = []; // Liste leeren
        fs.writeFileSync(itemsFile, JSON.stringify(items)); // Datei aktualisieren
        io.emit('updateItems', items); // Allen Spielern die leere Liste senden
    });

    // Beim Verbinden die aktuelle Begriffe-Liste senden
    socket.emit('updateItems', items);

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


// Neues Spiel starten (zurücksetzen)
socket.on('resetGame', () => {
    players = [];
    items = [];
    gameStarted = false;
    io.emit('gameReset'); // Allen Spielern mitteilen, dass das Spiel zurückgesetzt wurde
});


    // Spieler trennen
    socket.on('disconnect', () => {
        players = players.filter((player) => player.id !== socket.id);
        io.emit('updatePlayers', players);
    });
});

// Server starten
server.listen(3000, () => {
    console.log('Server läuft auf http://localhost:3000');
});
