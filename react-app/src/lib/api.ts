const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export type ChatResponse = {
  content: string
}

export async function sendMessage(content: string): Promise<ChatResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: content }),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = (await response.json()) as ChatResponse
    return data
  } catch (error) {
    return {
      content: 'This is a placeholder response. Connect your FastAPI backend at /api/chat to get real responses.',
    }
  }
}
