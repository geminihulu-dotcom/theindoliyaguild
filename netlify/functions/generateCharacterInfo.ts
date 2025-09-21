import { GoogleGenAI, Type } from "@google/genai";
import type { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';

// Enums copied from ../../types.ts to make the function self-contained
export enum CharacterClass {
    Fighter = "Fighter",
    Mage = "Mage",
    Assassin = "Assassin",
    Tanker = "Tanker",
    Healer = "Healer",
    Ranger = "Ranger",
}

export enum Rank {
    S_RANK = "S-Rank",
    A_RANK = "A-Rank",
    B_RANK = "B-Rank",
    C_RANK = "C-Rank",
    D_RANK = "D-Rank",
    E_RANK = "E-Rank",
}

// Interface for the expected JSON body
interface RequestBody {
    names: string[];
}

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    if (!event.body) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Missing request body' }),
        };
    }

    try {
        const { names } = JSON.parse(event.body) as RequestBody;

        if (!names || !Array.isArray(names)) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'The "names" property must be an array.' }),
            };
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY environment variable not set.");
        }
        const ai = new GoogleGenAI({ apiKey });

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

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: response.text,
        };

    } catch (error) {
        console.error("Error in generateCharacterInfo function:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Failed to generate character info.", error: error instanceof Error ? error.message : String(error) }),
        };
    }
};
