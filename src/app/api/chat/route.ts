// File: app/api/chat/route.ts

import { OpenAI } from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';

export const runtime = 'edge'; // Optional, remove this line if running locally without Edge support

const SYSTEM_PROMPT = `You are an AI assistant specialized in helping digital nomads discover and navigate network states and crypto cities. You have extensive knowledge about:

1. Network States like Próspera, Zuzalu, CityDAO, Cabin, Balaji's The Network State concepts
2. Charter cities and special economic zones
3. Crypto-native communities and DAOs
4. Governance models (DAO, charter city, community-led)
5. Blockchain infrastructure used by different cities
6. Membership requirements and application processes
7. Cost of living and annual membership fees
8. Cultural values and community focus areas

When users ask about where to live or which network state to join, provide personalized recommendations based on their:
- Values (governance, privacy, economic freedom, etc.)
- Lifestyle preferences (remote work, research, entrepreneurship)
- Budget considerations
- Geographic preferences
- Community size preferences

Always provide specific, actionable information and suggest next steps for joining communities.

Current Network States and Crypto Cities:

1. **Próspera (Honduras)**
   - Charter city with blockchain governance
   - $15,000 annual cost
   - Application required
   - Focus: Legal innovation, business-friendly
   - Website: https://prospera.hn

2. **CityDAO (Wyoming, USA)**
   - DAO-governed land ownership
   - Free to join (NFT purchase required)
   - Open membership
   - Focus: Decentralized land ownership
   - Website: https://citydao.io

3. **Zuzalu (Montenegro)**
   - Pop-up city for research
   - $8,000 annual cost
   - Application required
   - Focus: Longevity research, crypto innovation
   - Website: https://zuzalu.city

4. **Cabin (Global Network)**
   - Network city for creators
   - $2,400 annual cost
   - Application required
   - Focus: Remote work, nature, coliving
   - Website: https://cabin.city

5. **Kift (Africa)**
   - Network state for African innovators
   - $1,000 annual cost
   - Application required
   - Focus: African innovation, tech builders
   - Website: https://kift.co
`;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!, // Make sure this is set in your .env file
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body?.messages;

    if (!Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid messages array.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      stream: true,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (error: any) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({
        error: 'Error processing chat request',
        details: error?.message ?? 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
