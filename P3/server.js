const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const colors = require('colors');

const app = express();
const PORT = 3000;

const nicknames = {};
const typingUsers = new Set();

// Configuración de seguridad
app.use((req, res, next) => {
    res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' https://cdn.socket.io; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data:; " +
        "connect-src 'self' ws://localhost:3000; " +
        "frame-src 'none'; object-src 'none'"
    );
    next();
});

app.get('/favicon.ico', (req, res) => res.status(204).end());

const server = http.createServer(app);
const io = new Server(server);

let connectedUsers = 0;

app.use(express.static('public'));

// Emitir lista actual de nicknames a todos
function emitUserList() {
    const userList = Object.values(nicknames);
    io.emit('userList', userList);
}

io.on('connection', (socket) => {
    connectedUsers++;
    io.emit('updateUsers', connectedUsers);

    socket.emit('welcome', {
        type: 'system',
        text: '👋 ¡Bienvenido al chat! Por favor, establece tu nickname con /nick <tu_nombre>'
    });

    socket.on('setNickname', (nickname) => {
        nicknames[socket.id] = {
            name: nickname,
            color: '#000000'
        };

        socket.emit('message', {
            type: 'system',
            text: `👋 ¡Bienvenid@ ${nickname}! Escribe /help para ver los comandos disponibles.`
        });

        socket.broadcast.emit('message', {
            type: 'system',
            text: `🔔 ${nickname} se ha unido al chat`
        });

        emitUserList();
        io.emit('updateUsers', connectedUsers);
    });

    socket.on('typing', () => {
        const user = nicknames[socket.id];
        if (user && !typingUsers.has(socket.id)) {
            typingUsers.add(socket.id);
            socket.broadcast.emit('userTyping', {
                nickname: user.name,
                id: socket.id
            });
        }
    });

    socket.on('stopTyping', () => {
        if (typingUsers.has(socket.id)) {
            typingUsers.delete(socket.id);
            socket.broadcast.emit('userStopTyping',{
                is: socket.id
            });
        }
    });

    socket.on('disconnect', () => {
        if (typingUsers.has(socket.id)) {
            typingUsers.delete(socket.id);
            io.emit('userStopTyping', {
                id: socket.id
            });
        }
    });



    socket.on('chatMessage', async (msg) => {

        if (!nicknames[socket.id]) {
            nicknames[socket.id] = {
                name: 'Anónimo',
                color: '#000000'
            };
        }
        const currentUser = nicknames[socket.id];

        if (msg.startsWith('/')) {
            let response = '';
            const args = msg.trim().split(' ');
            const command = args[0].toLowerCase();

            switch (command) {
                case '/help':
                    response = '📝 Comandos disponibles: \n' +
                        '   ⁉️ /help - Muestra esta ayuda \n' +
                        '   📃 /list - Usuarios conectados \n' +
                        '   🖐️ /hello - Saludo del servidor \n' +
                        '   📅 /date - Fecha y hora actual \n'+
                        '   🖍️ /color - Cambiar color de la fuente ';
                    break;
                case '/list':
                    const userList = Object.values(nicknames).map(user => user.name).join(', ');
                    response = `👥 Usuarios conectados (${connectedUsers}): ${userList}`;
                    break;
                case '/hello':
                    response = '👋 ¡Hola! ¿Cómo estás?';
                    break;
                case '/date':
                    response = `📅 Fecha actual: ${new Date().toLocaleString()}`;
                    break;
                case '/color':
                    const validColors = {
                        'red': '#ff4d4d',
                        'blue': '#4d79ff',
                        'green': '#4dff4d',
                        'purple': '#b34dff',
                        'orange': '#ffa64d'
                    };
                    
                    if (args.length < 2 || !validColors[args[1]]) {
                        response = `⚠️ Uso: /color <color>\nColores disponibles: ${Object.keys(validColors).join(', ')}`;
                    } else {
                        nicknames[socket.id].color = validColors[args[1]];
                        response = `🎨 Color cambiado a ${args[1]}`;
                    }
                    break;
            }

            socket.emit('message', {
                type: 'system',
                text: response
            });
        } else {
            io.emit('message', {
                type: 'chat',
                sender: currentUser.name,
                text: msg,
                color: currentUser.color,
                timestamp: new Date().toLocaleTimeString()
            });
        }
    });

    socket.on('disconnect', () => {
        const nickname = nicknames[socket.id] || 'Un usuario';
        delete nicknames[socket.id];
        connectedUsers--;

        if (typingUsers.has(nickname)) {
            typingUsers.delete(nickname);
            io.emit('userStopTyping');
        }

        io.emit('message', {
            type: 'system',
            text: `🚪 ${nickname} ha salido del chat`
        });

        emitUserList();
        io.emit('updateUsers', connectedUsers);
    });
});

server.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`.rainbow);
});