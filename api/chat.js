export default async function handler(req, res) {
  const { profession, sections } = req.body;

  const prompt = `
  Create a professional resume tailored for a ${profession}.
  For each section, generate content that is ATS-friendly and highlights relevant skills.
  Sections:
  ${sections.map(s => `${s.name}: ${s.text}`).join("\n")}
  `;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: "claude-3-opus-20240229",
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();

    // Split AI output into sections (simple heuristic: split by section names)
    const outputs = sections.map(s => {
      const regex = new RegExp(`${s.name}:([\\s\\S]*?)(?=\\n[A-Z]|$)`, "i");
      const match = data.content[0].text.match(regex);
      return { name: s.name, output: match ? match[1].trim() : "" };
    });

    res.status(200).json({ sections: outputs });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate resume" });
  }
}
