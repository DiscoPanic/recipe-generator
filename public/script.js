let isGenerating = false;

async function generateRecipe() {
  const ingredientsInput = document.getElementById('ingredients');
  const generateButton = document.getElementById('generate-button');
  const recipeDisplay = document.getElementById('recipe');
  const ingredients = ingredientsInput.value.trim();

  // 🛑 Don't run if already generating
  if (isGenerating) return;

  // 🧪 Check input
  if (!ingredients) {
    alert('Please enter some ingredients');
    return;
  }

  // ✅ Now disable and proceed
  isGenerating = true;
  generateButton.disabled = true;
  generateButton.innerText = 'Generating...';
  recipeDisplay.innerText = 'Generating recipe...';

  try {
    const response = await fetch('/api/recipe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ingredients }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    recipeDisplay.innerText = data.recipe || 'No recipe found';
  } catch (error) {
    console.error('Error fetching recipe:', error);
    recipeDisplay.innerText = 'Error fetching recipe.';
  } finally {
    isGenerating = false;
    generateButton.disabled = false;
    generateButton.innerText = 'Generate Recipe';
  }
}

function expressInterest(school) {
  fetch('/api/interest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ school })
  })
  .then(res => res.json())
  .then(data => {
    document.getElementById('interest-result').innerText = `${school}: ${data.count} people are interested!`;
  })
  .catch(err => {
    document.getElementById('interest-result').innerText = 'Something went wrong.';
    console.error(err);
  });
}

// Attach once
document.getElementById('generate-button').addEventListener('click', generateRecipe);
