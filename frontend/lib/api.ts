// API client for backend communication

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Product {
  name: string;
  reason: string;
  category: string;
}

export interface RecommendationResponse {
  vibe_analysis: string;
  products: Product[];
}

export async function getRecommendations(vibe: string): Promise<RecommendationResponse> {
  const response = await fetch(`${API_BASE_URL}/recommend`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ vibe }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to get recommendations' }));
    throw new Error(error.detail || 'Failed to get recommendations');
  }

  return response.json();
}
