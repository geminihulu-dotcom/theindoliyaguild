import { GoogleGenAI, Type } from "@google/genai";
import type { GeneratedInfo, GeneratedCharacter } from "../types";
import { CharacterClass, Rank } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const generateCharacterInfo = async (names: string[]): Promise<GeneratedInfo[]> => {
  const prompt = `
    You are the 'System' from the manhwa 'Solo Leveling'. Generate an epic character profile for each of the following individuals, who are being 'awakened' as Hunters.
    For each name, create:
    1. A grandiose "Title" fitting for a powerful hunter (e.g., "The Shadow Monarch", "Monarch of Iron Body", "Sovereign of Plagues").
    2. A short, impactful "description" (one sentence) that hints at their unique abilities.
    3. A character "class" from the provided list.
    4. A Hunter "rank" from the provided list. Distribute the ranks, ensuring at least one S-Rank.
    5. A short, epic "quote" of 2-5 words that the character might say (e.g., "None can escape my gaze.").

    The profiles should sound powerful, unique, and directly inspired by the dark, high-fantasy world of Solo Leveling.
    Ensure the output is a valid JSON array.

    Names: ${names.join(', ')}
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: {
                type: Type.STRING,
                description: "The full name of the person, including their alias if provided.",
              },
              title: {
                type: Type.STRING,
                description: "The epic, Solo Leveling-style title.",
              },
              description: {
                type: Type.STRING,
                description: "A short, one-sentence description of their power.",
              },
              class: {
                type: Type.STRING,
                enum: Object.values(CharacterClass),
                description: "The character's class.",
              },
              rank: {
                type: Type.STRING,
                enum: Object.values(Rank),
                description: "The Hunter's assigned rank (S, A, B, etc.)."
              },
              quote: {
                type: Type.STRING,
                description: "A short, epic quote of 2-5 words."
              }
            },
            required: ["name", "title", "description", "class", "rank", "quote"],
          },
        },
      },
    });

    const jsonText = response.text.trim();
    const parsedData = JSON.parse(jsonText);
    
    if (!Array.isArray(parsedData)) {
        throw new Error("Gemini API did not return a valid JSON array.");
    }
    
    return parsedData as GeneratedInfo[];

  } catch (error) {
    console.error("Error calling Gemini API for character info:", error);
    throw new Error("Failed to generate character info from Gemini API.");
  }
};


export const generateCharacterImage = async (character: GeneratedCharacter): Promise<string> => {
    const isFemale = character.name.includes('Anjali');
    const genderTerm = isFemale ? 'female' : 'male';

    const prompt = `Anime character portrait, dark fantasy style. A powerful ${genderTerm} ${character.class || 'Fighter'} titled "${character.title || 'Hunter'}". ${character.description || ''}. Epic, manhwa art style, detailed, vibrant mana glow.`;

    try {
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
        return base64ImageBytes;

    } catch(error) {
        console.error("Error calling Gemini API for image generation:", error);
        throw new Error("Failed to generate character image from Gemini API.");
    }
}