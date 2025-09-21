import type { GeneratedInfo, GeneratedCharacter } from "../types";

export const generateCharacterInfo = async (names: string[]): Promise<GeneratedInfo[]> => {
  try {
    const response = await fetch('/.netlify/functions/generateCharacterInfo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ names }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch character info');
    }

    return await response.json();
  } catch (error) {
    console.error("Error calling generateCharacterInfo function:", error);
    throw new Error("Failed to generate character info from the serverless function.");
  }
};

export const generateCharacterImage = async (character: GeneratedCharacter): Promise<string> => {
  try {
    const response = await fetch('/.netlify/functions/generateCharacterImage', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(character),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch character image');
    }

    const { image } = await response.json();
    return image;
  } catch (error) {
    console.error("Error calling generateCharacterImage function:", error);
    throw new Error("Failed to generate character image from the serverless function.");
  }
};