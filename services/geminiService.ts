
import { GoogleGenAI, Type } from "@google/genai";
import { Message, Role, OptimizerResponse } from '../types';
import { MAIN_SYSTEM_PROMPT, OPTIMIZER_SYSTEM_PROMPT } from '../constants';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const formatMessageHistory = (history: Message[]) => {
    return history.map(message => ({
        role: message.role === Role.USER ? 'user' : 'model',
        parts: [{ text: message.content }],
    }));
};

export const generateStandardResponse = async (prompt: string, history: Message[]): Promise<string> => {
    try {
        const isFirstMessage = history.filter(m => m.role === Role.ASSISTANT).length === 0;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [...formatMessageHistory(history), { role: 'user', parts: [{ text: prompt }] }],
            config: {
                systemInstruction: isFirstMessage ? MAIN_SYSTEM_PROMPT : undefined,
            },
        });
        
        return response.text;
    } catch (error) {
        console.error("Gemini API Error (Standard):", error);
        return "An error occurred while communicating with the AI. Please check the console for details.";
    }
};

export const generateOptimizedPrompt = async (history: Message[]): Promise<OptimizerResponse> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: formatMessageHistory(history),
            config: {
                systemInstruction: OPTIMIZER_SYSTEM_PROMPT,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        status: { type: Type.STRING, enum: ["complete", "needs_more_info"] },
                        content: { type: Type.STRING }
                    },
                    required: ["status", "content"]
                }
            },
        });
        
        const jsonString = response.text.trim();
        const parsedResponse = JSON.parse(jsonString) as OptimizerResponse;
        return parsedResponse;
    } catch (error) {
        console.error("Gemini API Error (Optimizer):", error);
        return {
            status: 'needs_more_info',
            content: "I've encountered an error. Could you please rephrase your last response?",
        };
    }
};
