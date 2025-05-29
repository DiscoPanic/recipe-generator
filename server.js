require('dotenv').config();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const fsPromises = require('fs').promises;

const path = require('path');
const INTEREST_FILE = path.join(__dirname, 'interest.json');

// Helper: Read interest counts
async function readInterestData() {
  try {
    const data = await fsPromises.readFile(INTEREST_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return {};
  }
}

async function writeInterestData(data) {
  await fsPromises.writeFile(INTEREST_FILE, JSON.stringify(data, null, 2));
}

console.log("Starting server...");

const express = require('express');
const cors = require('cors');



const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, 'public')));

// API route
app.post('/api/recipe', async (req, res) => {
  const ingredients = req.body.ingredients;
  console.log('Received ingredients:', ingredients);

  const prompt = `Create a detailed, delicious recipe using only these ingredients: ${ingredients}`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    console.log("Gemini response:", JSON.stringify(data, null, 2));


    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      data?.candidates?.[0]?.content?.parts?.map(p => p.text).join("\n") ||
      "No recipe generated.";

    res.json({ recipe: text });
  } catch (err) {
    console.error("Error calling Gemini:", err);
    res.status(500).json({ recipe: "Something went wrong. Try again later." });
  }
});

// New route to handle interest clicks
app.post('/api/interest', (req, res) => {
  const { school } = req.body;
  if (!school) {
    return res.status(400).json({ error: 'No school provided.' });
  }

  const interestData = readInterestData();
  interestData[school] = (interestData[school] || 0) + 1;
  writeInterestData(interestData);

  res.json({ school, count: interestData[school] });
});

app.get('/api/interest', (req, res) => {
  const interestData = readInterestData();
  res.json(interestData);
});


// ✅ THIS IS THE CRITICAL PART:
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
// Open your browser and go to http://localhost:3000 to see the frontend