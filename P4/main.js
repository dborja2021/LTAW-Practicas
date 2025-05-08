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
    serverProcess = spawn('node', ['server/server.js']);

    serverProcess.stdout.on('data', (data) => {
        const log = data.toString();
        if (mainWindow) {
            mainWindow.webContents.send('server-log', log);
        }
        console.log('[Server]', log);
    });

    serverProcess.stderr.on('data', (data) => {
        console.error('[Server Error]', data.toString());
    });
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
        serverProcess.stdin.write('test-message\n');
    }
});