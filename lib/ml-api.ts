// ML Recommendation API Client for Next.js

const ML_API_URL = process.env.NEXT_PUBLIC_ML_API_URL || 'http://localhost:8000';

// Check if ML API is enabled
const ML_ENABLED = typeof window !== 'undefined' && ML_API_URL;

export interface ArticleRecommendation {
    index: number;
    title: string;
    author: string;
    claps: number;
    reading_time: number;
    similarity_score: number;
}

export interface RecommendationResponse {
    recommendations: ArticleRecommendation[];
    count: number;
}

/**
 * Get recommendations based on article content
 */
export async function getRecommendationsByContent(
    content: string,
    limit: number = 10
): Promise<RecommendationResponse> {
    try {
        const response = await fetch(`${ML_API_URL}/recommendations/by-content`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content,
                n_recommendations: limit,
            }),
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        throw error;
    }
}

/**
 * Get recommendations by searching for article title
 */
export async function getRecommendationsByTitle(
    title: string,
    limit: number = 10
): Promise<RecommendationResponse> {
    try {
        const response = await fetch(
            `${ML_API_URL}/recommendations/by-title?title=${encodeURIComponent(title)}&limit=${limit}`
        );

        if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        throw error;
    }
}

/**
 * Get similar articles by index
 */
export async function getSimilarArticles(
    articleIndex: number,
    limit: number = 10
): Promise<RecommendationResponse> {
    try {
        const response = await fetch(
            `${ML_API_URL}/recommendations/similar/${articleIndex}?limit=${limit}`
        );

        if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching similar articles:', error);
        throw error;
    }
}

/**
 * Get ML API statistics
 */
export async function getMLStats() {
    try {
        const response = await fetch(`${ML_API_URL}/stats`);

        if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching ML stats:', error);
        throw error;
    }
}

/**
 * Check if ML API is healthy
 */
export async function checkMLHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${ML_API_URL}/`);
        return response.ok;
    } catch (error) {
        return false;
    }
}
