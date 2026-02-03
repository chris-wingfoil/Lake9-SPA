
export interface StockPoint {
  date: string;
  price: number;
}

export interface AIProcessingResult {
  summary: string;
  doppelgangerPrompt: string;
  mathExpression: string;
  imageUrls: string[];
  visualNarrative: string;
}

export enum AppState {
  UPLOAD = 'UPLOAD',
  PROCESSING = 'PROCESSING',
  PREVIEW = 'PREVIEW'
}

export interface AIProvider {
  name: string;
  generateArt: (data: StockPoint[]) => Promise<AIProcessingResult>;
}
