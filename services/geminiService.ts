
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { SYSTEM_PERSONA } from "../constants";

// Initialize chat session with provided API Key and Model Name
// This allows Admin to configure the key in the UI dynamically.
export const createChatSession = (apiKey: string, modelName: string): Chat => {
  if (!apiKey) {
    throw new Error("API Key가 설정되지 않았습니다. 관리자 설정에서 키를 입력해주세요.");
  }

  const ai = new GoogleGenAI({ apiKey });

  return ai.chats.create({
    model: modelName,
    config: {
      systemInstruction: SYSTEM_PERSONA,
      temperature: 0.2,
    },
  });
};

export const sendMessageStream = async (
  chat: Chat,
  message: string
): Promise<AsyncIterable<string>> => {
  try {
    const resultStream = await chat.sendMessageStream({ message });

    async function* streamGenerator() {
      for await (const chunk of resultStream) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
          yield c.text;
        }
      }
    }

    return streamGenerator();
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    throw error;
  }
};

export const parseMenuImage = async (
  apiKey: string,
  modelName: string,
  imageBase64: string
): Promise<any> => {
  try {
    const client = new GoogleGenAI({ apiKey });

    // Base64 헤더 제거 (data:image/png;base64,...)
    const base64Data = imageBase64.split(',')[1];

    const prompt = `
      Analyze this menu image and extract the weekly menu data into a JSON format.
      The JSON should be an array of objects with the following structure:
      [
        {
          "day": "월",
          "date": "MM/DD",
          "lunch": {
            "main": "Main Dish Name",
            "main_en": "Main Dish Name in English",
            "soup": "Soup Name",
            "side": ["Side 1", "Side 2", "Side 3"],
            "side": ["Side 1", "Side 2", "Side 3"],
            "plus_menu": ["Plus Item 1", "Plus Item 2"], // Extract items from the bottom row of the lunch section (e.g. beverages, self-bar)
            "kcal": 800
          },
          "dinner": {
            "main": "Main Dish Name",
            "soup": "Soup Name",
            "side": ["Side 1", "Side 2", "Side 3"],
            "kcal": 800
          },
          "category": "한식" // e.g. "중식데이", "분식데이", "특식", or default "한식"
        },
        ...
      ]
      - Extract data for Monday to Friday.
      - If a field is missing, use an empty string or default value.
      - "side" should be an array of strings.
      - Ensure the output is strictly valid JSON without markdown formatting.
    `;

    const response = await client.models.generateContent({
      model: modelName,
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/png",
                data: base64Data
              }
            }
          ]
        }
      ]
    });

    const responseText = response.text;
    // JSON 파싱 (Markdown 코드 블록 제거)
    const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);

  } catch (error) {
    console.error("Error parsing menu image:", error);
    throw error;
  }
};
