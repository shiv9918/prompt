// Gemini API Integration Service
interface GeminiResponse {
  text: string;
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

interface PromptPreviewRequest {
  prompt: string;
  context?: string;
}

interface PromptPreviewResult {
  text?: string;
  imageBase64?: string;
}

class GeminiService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  constructor() {
    // Load Gemini API key from environment variable by default
    this.apiKey = import.meta.env.VITE_PUBLIC_API_KEY || '';
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    localStorage.setItem('gemini_api_key', apiKey);
  }

  hasApiKey(): boolean {
    return !!this.apiKey;
  }

  async generatePromptPreview(request: PromptPreviewRequest): Promise<PromptPreviewResult> {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured');
    }

    const prompt = `You are an AI assistant. Respond ONLY with the direct result, with no preamble, explanation, or introduction. Here is the prompt to preview:

"${request.prompt}"

${request.context ? `Context: ${request.context}` : ''}

Output only the result, as the user would expect to see it.`;

    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=' + this.apiKey, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
            responseModalities: ["TEXT", "IMAGE"]
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      if (data.candidates && data.candidates.length > 0) {
        const parts = data.candidates[0].content.parts;
        for (const part of parts) {
          if (part.inlineData && part.inlineData.data) {
            // Image part (base64)
            return { imageBase64: part.inlineData.data };
          } else if (part.text) {
            // Text part
            return { text: part.text };
      }
        }
      }
      throw new Error('No response generated');
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Failed to generate preview. Please check your API key and try again.');
    }
  }

  async generateTags(promptContent: string): Promise<string[]> {
    if (!this.apiKey) {
      return [];
    }

    const prompt = `Analyze this AI prompt and suggest 5-8 relevant tags that would help users discover it. Focus on the prompt's purpose, target use case, and AI model compatibility.

Prompt: "${promptContent}"

Return only a comma-separated list of tags, no other text.`;

    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 200,
          }
        })
      });

      if (response.ok) {
        const data: GeminiResponse = await response.json();
        if (data.candidates && data.candidates.length > 0) {
          const tagsText = data.candidates[0].content.parts[0].text;
          return tagsText.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
        }
      }
    } catch (error) {
      console.error('Tags generation error:', error);
    }

    return [];
  }

  async ratePromptQuality(promptContent: string): Promise<{ rating: number; feedback: string }> {
    if (!this.apiKey) {
      return { rating: 0, feedback: 'API key not configured' };
    }

    const prompt = `Analyze this AI prompt for quality and effectiveness. Rate it from 1-5 (5 being excellent) and provide brief constructive feedback.

Prompt: "${promptContent}"

Respond in this exact format:
Rating: [1-5]
Feedback: [Your brief feedback here]`;

    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 300,
          }
        })
      });

      if (response.ok) {
        const data: GeminiResponse = await response.json();
        if (data.candidates && data.candidates.length > 0) {
          const result = data.candidates[0].content.parts[0].text;
          const ratingMatch = result.match(/Rating:\s*(\d)/);
          const feedbackMatch = result.match(/Feedback:\s*(.+)/);
          
          return {
            rating: ratingMatch ? parseInt(ratingMatch[1]) : 3,
            feedback: feedbackMatch ? feedbackMatch[1].trim() : 'Unable to analyze prompt quality'
          };
        }
      }
    } catch (error) {
      console.error('Quality rating error:', error);
    }

    return { rating: 3, feedback: 'Unable to analyze prompt quality' };
  }
}

export const geminiService = new GeminiService();
export default geminiService;