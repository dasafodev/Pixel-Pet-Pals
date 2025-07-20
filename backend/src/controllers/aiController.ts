import type { Request, Response } from 'express';
import type { IApiResponse } from '@/types/common.js';
import Groq from 'groq-sdk';

interface ChatRequest {
  message: string;
  history?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

interface ChatResponse {
  response: string;
}

interface ErrorResponse {
  error: string;
}

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Configure Groq client using API key from environment variables
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const handleChat = async (req: Request<{}, ChatResponse | ErrorResponse, ChatRequest>, res: Response<ChatResponse | ErrorResponse>): Promise<void> => {
  const { message, history } = req.body; // Expecting the user's message and potentially conversation history

  if (!message) {
    res.status(400).json({ error: 'Message is required' });
    return;
  }

  try {
    // --- Groq API Call ---
    console.log('Sending message to Groq AI:', message);

    // Prepare messages for Groq API
    // Groq expects history to be an array of {role: 'user'/'assistant', content: '...'}
    // We'll keep it simple for now and just send the current user message.
    // You can expand this to include `history` if needed.
    const messagesForApi: GroqMessage[] = [
      {
        role: 'system',
        content: 'You are a helpful assistant integrated into a chat application.',
      },
      // Example for including history:
      // ...(history || []).map(msg => ({
      //   role: msg.sender === 'you' ? 'user' : 'assistant', // Adjust 'you' if sender name is different
      //   content: msg.text
      // })),
      { role: 'user', content: message },
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages: messagesForApi,
      model: 'llama3-8b-8192', // Using a smaller, faster model option as mixtral-8x7b-32768 is decommissioned
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
      stream: false, // Set to true if you want to stream responses
    });

    const aiResponse = chatCompletion.choices[0]?.message?.content;
    // --- End Groq API Call ---

    if (aiResponse) {
      console.log('Received Groq AI response:', aiResponse);
      res.json({ response: aiResponse });
    } else {
      console.error('Groq API response was empty or malformed:', chatCompletion);
      res.status(500).json({ error: 'Failed to get response from AI' });
    }
  } catch (error) {
    console.error('Error calling Groq AI service:', error);
    res.status(500).json({ error: 'Internal server error processing AI request' });
  }
};