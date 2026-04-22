const chatController = {
    // Handle AI chat messages
    async sendMessage(req, res) {
        try {
            const { message } = req.body;

            if (!message || message.trim() === '') {
                return res.status(400).json({ error: 'Message is required' });
            }

            // For production, integrate with actual AI API (e.g., OpenAI, Anthropic)
            // For now, using simple responses
            const response = await generateAIResponse(message);

            res.json({
                success: true,
                response: response,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Chat error:', error);
            res.status(500).json({
                error: 'Failed to process message',
                message: 'Please try again later'
            });
        }
    }
};

// Simple AI response generator (replace with actual AI API integration)
async function generateAIResponse(message) {
    // This is a placeholder. In production, use:
    // - OpenAI API
    // - Anthropic Claude
    // - Google Gemini
    // - Or other AI services

    const lowerMessage = message.toLowerCase();

    // Mental health focused responses
    if (lowerMessage.includes('suicide') || lowerMessage.includes('kill myself')) {
        return "I'm really concerned about what you're saying. Please reach out to emergency services immediately. In Kenya, you can call the Befrienders Kenya hotline at 0719 721 731 or visit the nearest hospital. You're not alone, and help is available.";
    }

    if (lowerMessage.includes('depressed') || lowerMessage.includes('depression')) {
        return "Depression can be very challenging. It's important to talk to a mental health professional. In the meantime, try reaching out to friends or family, and consider activities that usually bring you joy. Would you like resources for professional help?";
    }

    if (lowerMessage.includes('anxious') || lowerMessage.includes('anxiety')) {
        return "Anxiety is common but can be managed. Try deep breathing exercises: inhale for 4 counts, hold for 4, exhale for 4. If anxiety is interfering with your daily life, consider speaking with a therapist.";
    }

    if (lowerMessage.includes('stress')) {
        return "Stress affects us all. Try identifying what's causing your stress and see if there's anything you can change. Exercise, meditation, and talking to someone can help. What's been stressing you lately?";
    }

    if (lowerMessage.includes('lonely') || lowerMessage.includes('alone')) {
        return "Feeling lonely is tough. Remember that many people feel this way sometimes. Try reaching out to friends, joining a community group, or volunteering. You're not as alone as you might feel.";
    }

    // General supportive responses
    const generalResponses = [
        "I hear you. Can you tell me more about what's on your mind?",
        "That sounds challenging. How are you feeling about it right now?",
        "Everyone experiences difficult times. What helps you get through them?",
        "Thank you for sharing that. How long have you been feeling this way?",
        "It's brave of you to talk about this. What would be most helpful for you?",
        "Your feelings are valid. How can I support you right now?",
        "Let's take this one step at a time. What's one thing we can focus on?",
        "I'm here to listen. What's been going on for you lately?"
    ];

    return generalResponses[Math.floor(Math.random() * generalResponses.length)];
}

module.exports = chatController;