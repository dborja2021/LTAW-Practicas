const socket = io();
const messagesContainer = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const typingIndicator = document.getElementById('typing-indicator');
const usersCount = document.getElementById('users-count');

let nickname = null;
let isTyping = false;
let typingTimeout;
const typingUsers = {};
const receiveSound = document.getElementById('receiveSound');
let soundEnabled = true;

// Función para añadir un mensaje al chat
function addMessage(type, sender, text, timestamp = null, color = '#000000') {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', type);

//    if (type === 'chat') {
//        const userColor = getUserColor(sender); // Función que verifica abajo
//        messageElement.style.color = userColor;
//    }
    
    if (type !== 'system') {
        const senderElement = document.createElement('div');
        senderElement.classList.add('message-sender');
        senderElement.textContent = sender;
        senderElement.style.color = color
        messageElement.appendChild(senderElement);
    }
    
    const textElement = document.createElement('div');
    textElement.innerHTML = text.replace(/\n/g, '<br>');
    textElement.style.color = type === 'system' ? '#666' : color; 
    messageElement.appendChild(textElement);
    
    if (timestamp && type !== 'system') {
        const timeElement = document.createElement('div');
        timeElement.classList.add('message-time');
        timeElement.textContent = timestamp;
        messageElement.appendChild(timeElement);
    }
    
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Función para establecer el nickname
function setNickname() {
    const newNick = prompt('Por favor, introduce tu nickname:');
    if (newNick && newNick.trim() !== '') {
        nickname = newNick.trim();
        socket.emit('setNickname', nickname);
    } else {
        setNickname(); // Volver a pedir si no es válido
    }
}

// Función para mostrar quién está escribiendo
function showTypingIndicator(name) {
    typingIndicator.textContent = `${name} está escribiendo...`;
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        typingIndicator.textContent = '';
    }, 3000);
}

// Evento al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    setNickname();
});

document.getElementById('toggleSound').addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    document.getElementById('toggleSound').textContent = soundEnabled ? '🔊' : '🔇';
});

// Evento al enviar un mensaje
function sendMessage() {
    const message = messageInput.value.trim();
    if (message) {
        socket.emit('chatMessage', message);
        messageInput.value = '';
        
        if (soundEnabled) {
            sendSound.currentTime = 0; // Rebobinar
            sendSound.play().catch(e => console.log("Error de sonido:", e));
        }

        socket.emit('stopTyping');

        // Notificar que dejó de escribir
//        if (isTyping) {
//            socket.emit('stopTyping');
//            isTyping = false;
//        }
    }
}

sendButton.addEventListener('click', sendMessage);

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

messageInput.addEventListener('input', () => {
    if (messageInput.value.trim() !== '') {
        if (!typingTimeout) {
            socket.emit('typing');
        }
        
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            socket.emit('stopTyping');
            typingTimeout = null;
        }, 1500);
    } else {
        // Si el campo está vacío, detener inmediatamente
        socket.emit('stopTyping');
        clearTimeout(typingTimeout);
        typingTimeout = null;
    }
});

// Eventos del socket
socket.on('welcome', (data) => {
    addMessage('system', '', data.text);
});

socket.on('message', (data) => {
    if (data.type === 'chat') {
        const messageType = data.sender === nickname ? 'user' : 'other';
        addMessage(messageType, data.sender, data.text, data.timestamp, data.color);
    } else if (data.type === 'system') {
        addMessage('system', '', data.text);
    }

    if (soundEnabled && data.sender !== nickname) {
        receiveSound.currentTime = 0;
        receiveSound.play().catch(e => console.log("Error de sonido:", e));
    }
});

socket.on('userTyping', (data) => {
    typingUsers[data.id] = data.nickname;
    updateTypingIndicator();
});

socket.on('userStopTyping', (data) => {
    delete typingUsers[data.id];
    updateTypingIndicator();
});

socket.on('updateUsers', (count) => {
    usersCount.textContent = count;
});

socket.on('nicknameChanged', (newNick) => {
    nickname = newNick;
});

// Manejar reconexión si se pierde la conexión
socket.on('disconnect', () => {
    addMessage('system', '', '⚠️ Se perdió la conexión con el servidor. Intentando reconectar...');
});

socket.on('reconnect', () => {
    addMessage('system', '', '✅ Conexión restablecida');
    if (nickname) {
        socket.emit('setNickname', nickname);
    }
});

function updateTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    typingIndicator.innerHTML = '';
    
    const usersTyping = Object.values(typingUsers);
    if (usersTyping.length > 0) {
        const text = usersTyping.length === 1 
            ? `✍️ ${usersTyping[0]} está escribiendo...`
            : `✍️ ${usersTyping.join(', ')} están escribiendo...`;
        
        const indicator = document.createElement('div');
        indicator.textContent = text;
        typingIndicator.appendChild(indicator);
    }
}