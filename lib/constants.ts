// Article Categories
export const CATEGORIES = [
    'Technology',
    'Philosophy',
    'Startups',
    'Culture',
    'Design',
    'Science',
    'Business',
    'Health',
] as const;

export type Category = typeof CATEGORIES[number];

// Category metadata
export const CATEGORY_INFO: Record<string, { description: string; icon: string }> = {
    Technology: {
        description: 'Latest in tech, AI, and innovation',
        icon: '💻',
    },
    Philosophy: {
        description: 'Deep thoughts and philosophical insights',
        icon: '🤔',
    },
    Startups: {
        description: 'Entrepreneurship and startup stories',
        icon: '🚀',
    },
    Culture: {
        description: 'Arts, society, and cultural commentary',
        icon: '🎨',
    },
    Design: {
        description: 'UI/UX, graphics, and design thinking',
        icon: '✨',
    },
    Science: {
        description: 'Scientific discoveries and research',
        icon: '🔬',
    },
    Business: {
        description: 'Business strategy and insights',
        icon: '💼',
    },
    Health: {
        description: 'Wellness, fitness, and health tips',
        icon: '🏥',
    },
};
