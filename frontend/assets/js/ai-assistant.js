// AI Assistant with Voice Support
class AIAssistant {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.initSpeechRecognition();
        this.initEventListeners();
    }

    initSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';

            this.recognition.onstart = () => {
                this.isListening = true;
                document.getElementById('voiceBtn').classList.add('listening');
                document.getElementById('voiceBtn').innerHTML = '<i class="fas fa-stop"></i>';
            };

            this.recognition.onend = () => {
                this.isListening = false;
                document.getElementById('voiceBtn').classList.remove('listening');
                document.getElementById('voiceBtn').innerHTML = '<i class="fas fa-microphone"></i>';
            };

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                document.getElementById('messageInput').value = transcript;
                this.sendMessage(transcript);
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.isListening = false;
                document.getElementById('voiceBtn').classList.remove('listening');
                document.getElementById('voiceBtn').innerHTML = '<i class="fas fa-microphone"></i>';
            };
        } else {
            console.warn('Speech recognition not supported');
            document.getElementById('voiceBtn').style.display = 'none';
        }
    }

    initEventListeners() {
        // Voice button handled in HTML
    }

    toggleVoice() {
        if (this.isListening) {
            this.recognition.stop();
        } else {
            this.recognition.start();
        }
    }

    async sendMessage(message = null) {
        const input = document.getElementById('messageInput');
        const msg = message || input.value.trim();
        if (!msg) return;

        // Add user message
        this.addMessage(msg, 'user');
        input.value = '';

        // Show typing indicator
        this.showTyping();

        try {
            const response = await this.getAIResponse(msg);
            this.hideTyping();
            this.addMessage(response, 'bot');
            this.speakResponse(response);
        } catch (error) {
            this.hideTyping();
            this.addMessage('Sorry, I\'m having trouble connecting. Please try again.', 'bot');
            console.error('AI response error:', error);
        }
    }

    async getAIResponse(message) {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Not authenticated');
        }

        const response = await fetch('/api/chat/message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ message })
        });

        if (!response.ok) {
            throw new Error('Failed to get AI response');
        }

        const data = await response.json();
        return data.response;
    }

    addMessage(text, sender) {
        const messagesDiv = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        messageDiv.innerHTML = sender === 'bot' ? `<strong>AI Assistant:</strong> ${text}` : text;
        messagesDiv.appendChild(messageDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    showTyping() {
        const messagesDiv = document.getElementById('chatMessages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot';
        typingDiv.id = 'typing';
        typingDiv.innerHTML = '<strong>AI Assistant:</strong> <em>Typing...</em>';
        messagesDiv.appendChild(typingDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    hideTyping() {
        const typingDiv = document.getElementById('typing');
        if (typingDiv) typingDiv.remove();
    }

    speakResponse(text) {
        if (this.synthesis && 'speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            utterance.pitch = 1;
            this.synthesis.speak(utterance);
        }
    }
}

// Global functions for HTML onclick
function toggleVoice() {
    if (window.aiAssistant) {
        window.aiAssistant.toggleVoice();
    }
}

function sendMessage() {
    if (window.aiAssistant) {
        window.aiAssistant.sendMessage();
    }
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.aiAssistant = new AIAssistant();
});