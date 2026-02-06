
import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';
import { app } from '../config/firebase';
import { StockPoint, AIProcessingResult, AIProvider } from "../types";

const functions = getFunctions(app, 'us-central1');

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
