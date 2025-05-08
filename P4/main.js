const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const os = require('os');

let mainWindow;
let serverProcess;

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

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            enableClipboard: true
        }
    });

    // Iniciar servidor
    startServer();

    mainWindow.loadFile('index.html');
    // mainWindow.webContents.openDevTools(); // Solo para desarrollo
}

function startServer() {
    serverProcess = spawn('node', ['server/server.js'], {
        stdio: ['pipe', 'pipe', 'pipe']  // Asegura que stdin sea pipe
    });

    // Maneja errores de stdin
    serverProcess.stdin.on('error', (err) => {
        console.error('Error writing to server process:', err);
    });
    
    // Capturar logs del servidor
    serverProcess.stdout.on('data', (data) => {
      const log = data.toString().trim();
      if (log && mainWindow) {
        mainWindow.webContents.send('server-log', {
          type: 'system',
          message: log
        });
      }
    });

    // Mensajes del chat (proceso IPC)
    serverProcess.on('message', (msg) => {
        if (!mainWindow) return;
    
        switch (msg.type) {
          case 'chat-log':
            mainWindow.webContents.send('server-log', {
              type: 'chat',
              sender: msg.data.sender,
              message: msg.data.message,
              color: msg.data.color,
              timestamp: msg.data.timestamp
            });
            break;
          case 'system-log':
            mainWindow.webContents.send('server-log', {
              type: 'system',
              message: msg.data
            });
            break;
        }
      });
    
      serverProcess.stderr.on('data', (data) => {
        console.error('[Server Error]', data.toString());
      });
    }

// 👇 Función auxiliar para enviar logs al renderer
function sendLogToRenderer(type, message, color = '#333') {
    if (mainWindow) {
        mainWindow.webContents.send('server-log', { type, message, color });
    }
    console.log(`[${type}]`, message); // También aparece en la consola del servidor
}


app.whenReady().then(createWindow);

// Manejo de cierre
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        if (serverProcess) serverProcess.kill();
        app.quit();
    }
});

// IPC Handlers
ipcMain.handle('get-ip-address', () => getLocalIP());

ipcMain.on('send-test-message', () => {
    if (serverProcess) {
        // Envía el mensaje a través de stdin
        serverProcess.stdin.write(JSON.stringify({
            type: 'test-message',
            data: { message: 'Mensaje de prueba del servidor' }
        }) + '\n');
    }
});
