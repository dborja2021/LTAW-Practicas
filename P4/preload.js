const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getVersions: () => ({
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  }),
  getIPAddress: () => ipcRenderer.invoke('get-ip-address'),
  onServerLog: (callback) => ipcRenderer.on('server-log', callback),
  sendTestMessage: () => ipcRenderer.send('send-test-message')
});