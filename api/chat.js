// api/chat.js
export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "GEMINI_API_KEY not set in environment variables" });

  try {
    const { role, messages, system } = req.body;

    // Build prompt: role + system + messages
    let prompt = "";
    if (role) {
      prompt += `Generate a complete professional résumé tailored for the role: ${role}.\n\n`;
      prompt += `Include sections like Summary, Skills, Experience, Education, and Projects. Format it cleanly.\n\n`;
    }
    if (system) {
      prompt += system + "\n\n";
    }
    if (messages && Array.isArray(messages)) {
      prompt += messages.map(m => m.content).join("\n");
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 1024, temperature: 0.7 }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini error:", data);
      return res.status(response.status).json({ error: data?.error?.message || "Gemini API error" });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return res.status(200).json({
      content: [{ type: "text", text }]
    });

  } catch (err) {
    console.error("Proxy error:", err);
    return res.status(500).json({ error: "Internal server error: " + err.message });
  }
}
