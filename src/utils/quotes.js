export const QUOTES = {
    general: [
        "The best way to predict the future is to create it.",
        "Believe you can and you're halfway there.",
        "Don't watch the clock; do what it does. Keep going.",
        "Success is not final, failure is not fatal: It is the courage to continue that counts.",
        "Your time is limited, don't waste it living someone else's life.",
        "The only way to do great work is to love what you do.",
        "It always seems impossible until it is done.",
        "Start where you are. Use what you have. Do what you can.",
        "There are two blessings which many people lose: Health and Free Time. - Prophet Muhammad (PBUH)"
    ],
    productivity: [
        "Let's be productive today.",
        "Focus on the goal.",
        "Small steps lead to big results.",
        "Make today count.",
        "Your future is created by what you do today, not tomorrow.",
        "Don't stop until you're proud.",
        "Dream big. Start small. Act now."
    ]
};

export const getRandomQuote = (category = 'general') => {
    const quotes = QUOTES[category] || QUOTES.general;
    return quotes[Math.floor(Math.random() * quotes.length)];
};
