document.addEventListener('DOMContentLoaded', async () => {
    // Obtener versiones a través de la API expuesta
    const versions = window.electronAPI.getVersions();
    
    // Mostrar versiones
    document.getElementById('node-version').textContent = versions.node;
    document.getElementById('electron-version').textContent = versions.electron;
    document.getElementById('chrome-version').textContent = versions.chrome;

    // Obtener URL del servidor
    const ip = await window.electronAPI.getIPAddress();
    const chatUrl = `http://${ip}:3000/chat`;
    const urlInput = document.getElementById('server-url');
    urlInput.value = `http://${ip}:3000`;    


    // Botón de copiar URL
    document.getElementById('copy-btn').addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(urlInput.value);
            const originalText = document.getElementById('copy-btn').textContent;
            document.getElementById('copy-btn').textContent = '¡Copiado!';
            setTimeout(() => {
                document.getElementById('copy-btn').textContent = originalText;
            }, 2000);
        } catch (err) {
            console.error('Error al copiar: ', err);
            // Fallback para navegadores que no soportan Clipboard API
            urlInput.select();
            document.execCommand('copy');
        }
    });

    // Botón de prueba
    document.getElementById('test-btn').addEventListener('click', () => {
        window.electronAPI.sendTestMessage();
    });

    // Recibir logs del servidor
    window.electronAPI.onServerLog((log) => {
        const logsContainer = document.getElementById('server-logs');
        logsContainer.innerHTML += `<div>${log}</div>`;
        logsContainer.scrollTop = logsContainer.scrollHeight;
    });
});