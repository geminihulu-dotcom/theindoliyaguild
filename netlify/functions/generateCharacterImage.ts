import { GoogleGenAI } from "@google/genai";
import type { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';

// Interfaces copied from ../../types.ts to make the function self-contained
export enum CharacterClass {
    Fighter = "Fighter",
    Mage = "Mage",
    Assassin = "Assassin",
    Tanker = "Tanker",
    Healer = "Healer",
    Ranger = "Ranger",
}

export interface GeneratedCharacter {
    id: number;
    name: string;
    alias?: string;
    title?: string;
    description?: string;
    class?: CharacterClass;
    rank?: string;
    quote?: string;
    imageUrl?: string;
}

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    if (!event.body) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Missing request body' }),
        };
    }

    try {
        const character = JSON.parse(event.body) as GeneratedCharacter;
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY environment variable not set.");
        }
        const ai = new GoogleGenAI({ apiKey });

        const isFemale = character.name.includes('Anjali');
        const genderTerm = isFemale ? 'female' : 'male';
        const prompt = `Anime character portrait, dark fantasy style. A powerful ${genderTerm} ${character.class || 'Fighter'} titled "${character.title || 'Hunter'}". ${character.description || ''}. Epic, manhwa art style, detailed, vibrant mana glow.`;

        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '3:4',
            },
        });

        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: base64ImageBytes }),
        };

    } catch (error) {
        console.error("Error in generateCharacterImage function:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Failed to generate character image.", error: error instanceof Error ? error.message : String(error) }),
        };
    }
};
