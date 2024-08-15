export interface VerifyUserResponse {
  message: string;
}

export async function apiPost<T>(endpoint: string, data: any): Promise<T> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.error || 'Failed to fetch');
  }

  return response.json() as Promise<T>;
}
