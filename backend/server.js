require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const fs = require("fs");
const axios = require("axios");
const app = express();
app.use(cors());
app.use(express.json());

// 📁 Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// 📌 Ensure uploads folder exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// 🚀 UPLOAD + AI ANALYSIS
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;

    // 📄 Read PDF
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    const text = data.text;

    // ⚠️ Limit text (important for speed + cost)
    const trimmedText = text.slice(0, 4000);

   const ollamaResponse = await axios.post("http://localhost:11434/api/generate", {
  model: "llama3",
  prompt: `
You are an AI that extracts exam topics.

STRICT RULES:
- Return ONLY JSON
- No explanation
- No sentences
- No bullets
- No extra text

Format:
["Topic 1", "Topic 2", "Topic 3"]

Extract clean academic topics from this paper:

${trimmedText}
`,
  stream: false
});

const aiTopicsRaw = ollamaResponse.data.response;

// ✅ TRY JSON PARSE FIRST
let extractedTopics = [];

try {
  extractedTopics = JSON.parse(aiTopicsRaw);
} catch (err) {
  console.log("⚠️ JSON failed, using fallback cleaning");

  extractedTopics = aiTopicsRaw
    .split("\n")
    .map(t => t.replace(/[-•\d.*]/g, "").trim())
    .filter(t =>
      t.length > 3 &&
      t.length < 50 &&
      !t.toLowerCase().includes("here are") &&
      !t.includes(":")
    );
}

// ✅ SPLIT COMBINED TOPICS
extractedTopics = extractedTopics.flatMap(t =>
  t.split(",").map(x => x.trim())
);

// ✅ REMOVE DUPLICATES
extractedTopics = [...new Set(extractedTopics)];

    // 🎯 Rank topics
   const rankedTopics = extractedTopics.map((topic, index) => ({
  topic,
  count: extractedTopics.length - index,
  score: (extractedTopics.length - index) * 2,
  difficulty:
    index < 2 ? "Hard 🔴" :
    index < 5 ? "Medium 🟡" :
    "Easy 🟢"
}));

    // 📚 Mock syllabus (you can improve later)
    const syllabus = [
      "Computer Networks",
      "Cyber Security",
      "DBMS",
      "Operating Systems",
      "Machine Learning",
      "Artificial Intelligence"
    ];

    // ✅ Coverage
    const coveredTopics = rankedTopics.map(t => t.topic);
    const missingTopics = syllabus.filter(s => !coveredTopics.includes(s));

    // 📘 Practice suggestions
    const practice = rankedTopics.map(item => ({
      topic: item.topic,
      suggestion: `Revise previous year questions of ${item.topic}`
    }));

    // 📅 Study Plan
    const studyPlan = rankedTopics.map((item, index) => ({
      day: `Day ${index + 1}`,
      topic: item.topic,
      focus: item.score > 8 ? "High Priority ⭐" : "Medium Priority"
    }));

    // 📤 Response
    res.json({
      topics: rankedTopics,
      plan: studyPlan,
      coverage: {
        covered: coveredTopics,
        missing: missingTopics
      },
      practice: practice
    });

  } catch (error) {
    console.error(error);
    res.status(500).send("Error extracting text ❌");
  }
});

// 🟢 Test route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// 🚀 Start server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});