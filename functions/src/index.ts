import * as functions from 'firebase-functions';
import { GoogleGenAI, Type } from '@google/genai';
import { defineSecret } from 'firebase-functions/params';

const geminiApiKey = defineSecret('GEMINI_API_KEY');

interface RequestData {
  stockData: Array<{
    date: string;
    price: number;
  }>;
}

interface AIProcessingResult {
  summary: string;
  doppelgangerPrompt: string;
  mathExpression: string;
  imageUrls: string[];
  visualNarrative: string;
}

export const generateArt = functions
  .runWith({ secrets: [geminiApiKey] })
  .https.onCall(async (data: RequestData) => {
    const apiKey = geminiApiKey.value();
    
    if (!apiKey) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'API key not configured'
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const stockData = data.stockData;
    const dataStr = JSON.stringify(stockData);

  try {
    // Step 1: Manager AI Orchestration (Text Processing)
    const textResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are the Lead Manager AI for Lake9.com. 
      Analyze this stock data: ${dataStr}. 
      Task your sub-AIs: 
      1. CurveGen: Create a simple mathematical expression representing the trend.
      2. Doppelganger: Identify a real-world physical object (e.g. a car fender, a mountain range, an animal's spine) that mirrors this curve shape. 
      3. Narrative: Create a short viral-ready summary.
      
      Provide a JSON response.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            doppelgangerPrompt: { type: Type.STRING, description: 'Detailed prompt for image generation of the matching object' },
            mathExpression: { type: Type.STRING },
            visualNarrative: { type: Type.STRING }
          },
          required: ['summary', 'doppelgangerPrompt', 'mathExpression', 'visualNarrative']
        }
      }
    });

    const parsed = JSON.parse(textResponse.text || '{}');

    // Step 2: Image Generation (Visualizing the Doppelganger)
    const imageResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: `Create a sleek, artistic, 3D rendered visualization of ${parsed.doppelgangerPrompt}. It should look like high-end product design, minimalist, with a chrome or obsidian finish. 4K resolution, cinematic lighting.` }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: '16:9'
        }
      }
    });

    const imageUrls: string[] = [];
    for (const part of imageResponse.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        imageUrls.push(`data:image/png;base64,${part.inlineData.data}`);
      }
    }

    const result: AIProcessingResult = {
      summary: parsed.summary,
      doppelgangerPrompt: parsed.doppelgangerPrompt,
      mathExpression: parsed.mathExpression,
      imageUrls: imageUrls.length > 0 ? imageUrls : ['https://picsum.photos/800/450'],
      visualNarrative: parsed.visualNarrative
    };

    return result;
  } catch (error) {
    console.error('Error in generateArt:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to process AI request'
    );
  }
});
