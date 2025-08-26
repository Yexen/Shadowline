// server.js
import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch"; // if Node < 18

const app = express();
app.use(bodyParser.json());

// Protect with the DEV_CONSOLE_KEY
const DEV_KEY = process.env.DEV_CONSOLE_KEY || "";

app.post("/api/ai", async (req, res) => {
  const { key, message } = req.body;
  if (key !== DEV_KEY) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  try {
    // Call OpenAI (or your model) here
    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: message }]
      })
    });

    const data = await aiResponse.json();
    res.json({ reply: data.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI request failed" });
  }
});

app.listen(8080, () => console.log("Dev Console AI running on :8080"));
