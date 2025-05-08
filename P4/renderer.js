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
        
        // Opcional: Feedback visual
        const btn = document.getElementById('test-btn');
        const originalText = btn.textContent;
        btn.textContent = 'Enviando...';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 1000);
    });

    // Recibir logs del servidor
    window.electronAPI.onServerLog((event, log) => {
        const logsContainer = document.getElementById('server-logs');
        const logElement = document.createElement('div');
        logElement.style.padding = '4px';
        logElement.style.margin = '2px 0';
        logElement.style.borderBottom = '1px solid #eee';
      
        if (log.type === 'chat') {
          logElement.innerHTML = `
            <span style="color: ${log.color}; font-weight: bold">${log.sender}:</span>
            <span>${log.message}</span>
            <small style="color: #666; margin-left: 10px">${log.timestamp}</small>
          `;
        } else {
          logElement.innerHTML = `
            <span style="color: #888; font-style: italic">[Sistema] ${log.message}</span>
          `;
        }
      
        logsContainer.appendChild(logElement);
        logsContainer.scrollTop = logsContainer.scrollHeight;
      });
});