const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const colors = require('colors');
const os = require('os');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const nicknames = {};
const typingUsers = new Set();
let connectedUsers = 0;

// Configuración de rutas
const publicPath = path.join(process.cwd(), 'public');

process.stdin.on('data', (data) => {
    try {
        const message = JSON.parse(data.toString().trim());
        if (message.type === 'test-message') {
            io.emit('message', {
                type: 'system',
                text: `🔔 ${message.data.message}`,
                timestamp: new Date().toLocaleTimeString()
            });
        }
    } catch (err) {
        console.error('Error procesando mensaje:', err);
    }
});

// Asegúrate de que stdin esté en modo pausable
process.stdin.resume();


app.use(express.static(publicPath));

// Manejar mensajes del proceso padre (Electron)
process.on('message', (msg) => {
  if (msg === 'shutdown') process.exit();
});

// Rutas principales
app.get(['/', '/chat'], (req, res) => {
  res.sendFile(path.join(publicPath, 'chat.html'));
});

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

// Socket.IO Events
io.on('connection', (socket) => {
  connectedUsers++;
  io.emit('updateUsers', connectedUsers);
  
  // Notificar a Electron
  if (process.send) {
    process.send({
      type: 'system-log',
      data: `Nuevo cliente conectado (ID: ${socket.id})`
    });
  }

  socket.emit('welcome', {
    type: 'system',
    text: '👋 ¡Bienvenido al chat! Por favor, establece tu nickname con /nick <tu_nombre>'
  });

  socket.on('setNickname', (nickname) => {
    nicknames[socket.id] = {
      name: nickname,
      color: '#000000'
    };

    // Notificar a Electron
    if (process.send) {
      process.send({
        type: 'system-log',
        data: `Usuario ${nickname} se ha unido al chat`
      });
    }

    socket.emit('message', {
      type: 'system',
      text: `👋 ¡Bienvenid@ ${nickname}! Escribe /help para ver los comandos disponibles.`
    });

    socket.broadcast.emit('message', {
      type: 'system',
      text: `🔔 ${nickname} se ha unido al chat`
    });

    emitUserList();
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
      socket.broadcast.emit('userStopTyping', {
        id: socket.id
      });
    }
  });

  socket.on('chatMessage', (msg) => {
    if (!nicknames[socket.id]) {
      nicknames[socket.id] = {
        name: 'Anónimo',
        color: '#000000'
      };
    }
    const currentUser = nicknames[socket.id];
    const timestamp = new Date().toLocaleTimeString();

    if (msg.startsWith('/')) {
      // Manejo de comandos (existente)
      handleCommand(socket, msg);
    } else {
      const messageData = {
        type: 'chat',
        sender: currentUser.name,
        text: msg,
        color: currentUser.color,
        timestamp: timestamp
      };

      // Enviar a todos los clientes del chat
      io.emit('message', messageData);

      // Enviar al panel de administración (Electron)
      if (process.send) {
        process.send({
          type: 'chat-log',
          data: {
            sender: currentUser.name,
            message: msg,
            color: currentUser.color,
            timestamp: timestamp
          }
        });
      }
    }
  });

  socket.on('disconnect', () => {
    const nickname = nicknames[socket.id]?.name || 'Anónimo';
    delete nicknames[socket.id];
    connectedUsers--;

    // Notificar a Electron
    if (process.send) {
      process.send({
        type: 'system-log',
        data: `${nickname} se ha desconectado`
      });
    }

    io.emit('message', {
      type: 'system',
      text: `🚪 ${nickname} ha salido del chat`
    });

    emitUserList();
    io.emit('updateUsers', connectedUsers);
  });

  // Manejar mensajes de prueba desde Electron
  socket.on('test-message', (data) => {
    const timestamp = new Date().toLocaleTimeString();
    io.emit('message', {
        type: 'system',
        text: `🔔 Mensaje de prueba del servidor: ${data.message}`,
        timestamp: timestamp
    });

    if (process.send) {
        process.send({
            type: 'system-log',
            data: `Mensaje de prueba enviado: ${data.message}`
        });
    }
});
});

// Función para manejar comandos
function handleCommand(socket, msg) {
  const args = msg.trim().split(' ');
  const command = args[0].toLowerCase();
  let response = '';

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
    default:
      response = `❌ Comando desconocido: ${command}`;
  }

  socket.emit('message', {
    type: 'system',
    text: response
  });
}

// Función auxiliar
function emitUserList() {
  const userList = Object.values(nicknames);
  io.emit('userList', userList);
}

// Iniciar servidor
const PORT = 3000;
server.listen(PORT, () => {
  const ip = getLocalIP();
  console.log(`✅ Servidor listo en http://${ip}:${PORT}`);

  // Notificar a Electron
  if (process.send) {
    process.send({
      type: 'system-log',
      data: `Servidor iniciado en http://${ip}:${PORT}`
    });
  }
});

// Función para obtener IP local
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const iface of Object.values(interfaces)) {
    for (const config of iface) {
      if (config.family === 'IPv4' && !config.internal) {
        return config.address;
      }
    }
  }
  return 'localhost';
}