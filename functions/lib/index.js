"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateArt = void 0;
const functions = __importStar(require("firebase-functions"));
const genai_1 = require("@google/genai");
const params_1 = require("firebase-functions/params");
const geminiApiKey = (0, params_1.defineSecret)('GEMINI_API_KEY');
// NOTE: CORS is automatically handled by Firebase Callable Functions (onCall).
// The function can only be called from your Firebase project's authorized domains
// which are configured in Firebase Console > Authentication > Settings > Authorized domains
// Current authorized domains: lake9-dev.web.app, lake9-dev.firebaseapp.com
exports.generateArt = functions
    .runWith({ secrets: [geminiApiKey] })
    .https.onCall(async (data) => {
    var _a, _b, _c;
    const apiKey = geminiApiKey.value();
    if (!apiKey) {
        throw new functions.https.HttpsError('failed-precondition', 'API key not configured');
    }
    const ai = new genai_1.GoogleGenAI({ apiKey });
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
                    type: genai_1.Type.OBJECT,
                    properties: {
                        summary: { type: genai_1.Type.STRING },
                        doppelgangerPrompt: { type: genai_1.Type.STRING, description: 'Detailed prompt for image generation of the matching object' },
                        mathExpression: { type: genai_1.Type.STRING },
                        visualNarrative: { type: genai_1.Type.STRING }
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
        const imageUrls = [];
        for (const part of ((_c = (_b = (_a = imageResponse.candidates) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.parts) || []) {
            if (part.inlineData) {
                imageUrls.push(`data:image/png;base64,${part.inlineData.data}`);
            }
        }
        const result = {
            summary: parsed.summary,
            doppelgangerPrompt: parsed.doppelgangerPrompt,
            mathExpression: parsed.mathExpression,
            imageUrls: imageUrls.length > 0 ? imageUrls : ['https://picsum.photos/800/450'],
            visualNarrative: parsed.visualNarrative
        };
        return result;
    }
    catch (error) {
        console.error('Error in generateArt:', error);
        throw new functions.https.HttpsError('internal', 'Failed to process AI request');
    }
});
//# sourceMappingURL=index.js.map