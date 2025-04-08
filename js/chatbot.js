document.addEventListener('DOMContentLoaded', function() {
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotPopup = document.getElementById('chatbot-popup');
    const closeBtn = document.querySelector('.close-chatbot');
    const sendBtn = document.getElementById('send-message');
    const chatInput = document.getElementById('chatbot-input');
    const chatMessages = document.getElementById('chatbot-messages');

    // Toggle Chat
    chatbotToggle.addEventListener('click', () => {
        chatbotPopup.classList.toggle('active');
    });

    // Close Chat
    closeBtn.addEventListener('click', () => {
        chatbotPopup.classList.remove('active');
    });

    // Send Message
    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;

        // Add user message
        addMessage(message, 'user');
        chatInput.value = '';
        
        // Show typing indicator
        const typingIndicator = document.createElement('div');
        typingIndicator.classList.add('bot-message', 'typing-indicator');
        typingIndicator.innerHTML = '<p><span>.</span><span>.</span><span>.</span></p>';
        chatMessages.appendChild(typingIndicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Send request to server
        fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        })
        .then(response => response.json())
        .then(data => {
            // Remove typing indicator
            chatMessages.removeChild(typingIndicator);
            
            // Add bot response with markdown parsing
            addMessage(data.reply, 'bot');
        })
        .catch(error => {
            console.error('Error:', error);
            chatMessages.removeChild(typingIndicator);
            addMessage('Sorry, I encountered an error. Please try again later.', 'bot');
        });
    }

    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add(`${sender}-message`);
        
        // Parse markdown if it's a bot message
        if (sender === 'bot') {
            // Parse bold text (**text**)
            text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            
            // Parse italic text (*text*)
            text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
            
            // Parse bullet points
            text = text.replace(/^- (.*)/gm, '<li>$1</li>');
            text = text.replace(/<li>(.*)<\/li>/g, '<ul><li>$1</li></ul>');
            
            // Parse numbered lists
            text = text.replace(/^\d+\. (.*)/gm, '<li>$1</li>');
            text = text.replace(/<li>(.*)<\/li>/g, '<ol><li>$1</li></ol>');
            
            // Parse headings (# Heading)
            text = text.replace(/^# (.*)/gm, '<h3>$1</h3>');
            text = text.replace(/^## (.*)/gm, '<h4>$1</h4>');
            
            // Parse line breaks
            text = text.replace(/\n/g, '<br>');
        }
        
        messageDiv.innerHTML = `<p>${text}</p>`;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});
