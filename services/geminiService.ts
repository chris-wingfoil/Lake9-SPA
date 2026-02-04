
import { getFunctions, httpsCallable } from 'firebase/functions';
import { initializeApp } from 'firebase/app';
import { StockPoint, AIProcessingResult, AIProvider } from "../types";

const firebaseConfig = {
  projectId: 'lake9-dev',
};

const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);

export class GeminiProvider implements AIProvider {
  name = "Gemini Flash";

  async generateArt(data: StockPoint[]): Promise<AIProcessingResult> {
    const generateArtFunction = httpsCallable<{ stockData: StockPoint[] }, AIProcessingResult>(
      functions,
      'generateArt'
    );

    try {
      const result = await generateArtFunction({ stockData: data });
      return result.data;
    } catch (error) {
      console.error('Error calling Firebase Function:', error);
      throw new Error('Failed to process AI request. Please try again.');
    }
  }
}
