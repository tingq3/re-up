import fs from "node:fs";
import path from "node:path";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("Missing GEMINI_API_KEY in .env.local");
  process.exit(1);
}

const imagePath = process.argv[2] ?? "test-fridge.jpg";

if (!fs.existsSync(imagePath)) {
  console.error(`Image not found: ${imagePath}`);
  process.exit(1);
}

const extension = path.extname(imagePath).toLowerCase();

const mimeTypes = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

const mimeType = mimeTypes[extension];

if (!mimeType) {
  console.error("Use a JPG, JPEG, PNG, or WEBP image.");
  process.exit(1);
}

const imageData = fs.readFileSync(imagePath, {
  encoding: "base64",
});

const ai = new GoogleGenAI({
  apiKey,
});

const prompt = `
Identify all clearly visible edible ingredients in this fridge image.

Return only the ingredient name, estimated visible quantity, and estimated urgency.

Urgency must be exactly one of:

- "fresh": appears visually fresh with no obvious signs of deterioration
- "mid": appears usable but should probably be used soon, or the condition is uncertain
- "close_to_expired": shows visible signs of deterioration or has a clearly readable date that is approaching

Important rules:

- Only include food that is clearly visible.
- Do not guess hidden ingredients.
- Do not claim that food is safe or unsafe to eat.
- Quantity can be approximate, such as "3", "half bag", or "1 carton".
- Urgency is only a visual estimate and will be confirmed by the user.
- Do not include explanations or additional fields.

Return JSON in exactly this structure:

{
  "ingredients": [
    {
      "name": "ingredient name",
      "quantity": "estimated quantity",
      "urgency": "fresh, mid, or close_to_expired"
    }
  ]
}
`.trim();

try {
  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }, { inlineData: { mimeType, data: imageData } }],
      },
    ],
    config: { responseMimeType: "application/json" },
  });

  console.log("\nGemini result:\n");
  console.log(response.text);
} catch (error) {
  console.error("\nGemini request failed:");
  console.error(error);
  process.exit(1);
}