// import { NextRequest, NextResponse } from "next/server";

// export async function POST(req: NextRequest) {
//   const { messages } = await req.json();

//   const systemPrompt = `
//    You are a helpful, friendly virtual vet assistant.
// When answering user questions about pet symptoms, follow this structure:
// 1. "Start with a short, empathetic sentence to acknowledge the pet owner's concern."
// 2. "List 2-4 of the most likely causes, starting with the most urgent/common ones."
// 3. "Give 1-2 quick actions the owner can take now (e.g., check for fleas, give a bath)."
// 4. "Include a clear warning if it might need vet attention, especially for red flags (e.g., hair loss, sores, constant scratching)."
// 5. "Keep the entire response under 100 words."
// `;

//   const prompt =
//     systemPrompt +
//     "\n" +
//     messages
//       .map((m: any) => `${m.role === "user" ? "User" : "VetBot"}: ${m.content}`)
//       .join("\n") +
//     "\nVetBot:";

//   const response = await fetch(
//     "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=" +
//       process.env.GEMINI_API_KEY,
//     {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         contents: [{ role: "user", parts: [{ text: prompt }] }],
//       }),
//     }
//   );

//   const data = await response.json();
//   const reply =
//     data.candidates?.[0]?.content?.parts?.[0]?.text ||
//     "Sorry, something went wrong.";
//   return NextResponse.json({ reply });
// }
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { messages, imageBase64 } = await req.json();

  const systemPrompt = `
You are a helpful, friendly virtual vet assistant.
When answering user questions about pet symptoms, follow this structure:
1. "Start with a short, empathetic sentence to acknowledge the pet owner's concern."
2. "If an image is provided, analyze it and describe what can be visually observed (e.g., redness, swelling, skin lesions, posture). Be cautious and avoid making a medical diagnosis based solely on the image."
3. "List 2-4 likely causes based on the symptom (and the image if available), starting with the most urgent or common ones."
4. "Offer 1-2 quick, safe actions the owner can take at home (e.g., gentle cleaning, temporary isolation, bland diet)."
5. "Clearly recommend seeing a vet if symptoms are severe, persistent, or worsening - especially if the image shows signs like open wounds, swelling, or unusual behavior."
6. "Keep the entire response under 100 words, unless more explanation is specifically requested."
Use a kind, conversational tone. Never provide a final diagnosis. Always encourage follow-up with a licensed vet for confirmation.
`;

  const parts: any[] = [{ text: systemPrompt }];
  for (const m of messages) {
    parts.push({
      text: `${m.role === "user" ? "User" : "VetBot"}: ${m.content}`,
    });
  }

  if (imageBase64) {
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: imageBase64,
      },
    });
  }

  const body = JSON.stringify({
    contents: [
      {
        role: "user",
        parts,
      },
    ],
  });

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
      process.env.GEMINI_API_KEY,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    }
  );

  const data = await response.json();
  console.log("Gemini API response:", JSON.stringify(data, null, 2));

  const reply =
    data.candidates?.[0]?.content?.parts?.[0]?.text ||
    "Sorry, something went wrong.";
  return NextResponse.json({ reply });
}
