const socket = io();
const messagesContainer = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const typingIndicator = document.getElementById('typing-indicator');
const usersCount = document.getElementById('users-count');

let nickname = null;
let isTyping = false;
let typingTimeout;

// Función para añadir un mensaje al chat
function addMessage(type, sender, text, timestamp = null) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', type);
    
    if (type !== 'system') {
        const senderElement = document.createElement('div');
        senderElement.classList.add('message-sender');
        senderElement.textContent = sender;
        messageElement.appendChild(senderElement);
    }
    
    const textElement = document.createElement('div');
    textElement.textContent = text;
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

// Evento al enviar un mensaje
function sendMessage() {
    const message = messageInput.value.trim();
    if (message) {
        socket.emit('chatMessage', message);
        messageInput.value = '';
        
        // Notificar que dejó de escribir
        if (isTyping) {
            socket.emit('stopTyping');
            isTyping = false;
        }
    }
}

sendButton.addEventListener('click', sendMessage);

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Detectar cuando el usuario está escribiendo
messageInput.addEventListener('input', () => {
    if (!isTyping && messageInput.value.trim() !== '') {
        socket.emit('typing');
        isTyping = true;
    } else if (isTyping && messageInput.value.trim() === '') {
        socket.emit('stopTyping');
        isTyping = false;
    }
});

// Eventos del socket
socket.on('welcome', (data) => {
    addMessage('system', '', data.text);
});

socket.on('message', (data) => {
    if (data.type === 'chat') {
        const messageType = data.sender === nickname ? 'user' : 'other';
        addMessage(messageType, data.sender, data.text, data.timestamp);
    } else if (data.type === 'system') {
        addMessage('system', '', data.text);
    }
});

socket.on('userTyping', (name) => {
    if (name !== nickname) {
        showTypingIndicator(name);
    }
});

socket.on('userStopTyping', () => {
    typingIndicator.textContent = '';
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