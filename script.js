const guessInput = document.getElementById('guess-input');
const submitBtn = document.getElementById('submit-btn');
const guessGrid = document.getElementById('guess-grid');
const resultMessage = document.getElementById('result-message');
const fishListElement = document.getElementById('fish-list');
const resultsDiv = document.getElementById("results");

const fishData = [
  {
    name: "Betta",
    genus: "Betta",
    diet: "Carnivore",
    size: "Small",
    behavior: "Aggressive",
    tankLevel: "Top"
  },
  {
    name: "Neon Tetra",
    genus: "Paracheirodon",
    diet: "Omnivore",
    size: "Small",
    behavior: "Peaceful",
    tankLevel: "Middle"
  },
  {
    name: "Corydoras",
    genus: "Corydoras",
    diet: "Omnivore",
    size: "Small",
    behavior: "Peaceful",
    tankLevel: "Bottom"
  },
  {
    name: "Angelfish",
    genus: "Pterophyllum",
    diet: "Omnivore",
    size: "Medium",
    behavior: "Semi-Aggressive",
    tankLevel: "Middle"
  },
  {
    name: "Guppy",
    genus: "Poecilia",
    diet: "Omnivore",
    size: "Small",
    behavior: "Peaceful",
    tankLevel: "Top"
  }
];


// Placeholder target
const targetFish = fishData[Math.floor(Math.random() * fishData.length)];

const fishNames = [
  "Betta",
  "Neon Tetra",
  "Corydoras",
  "Guppy",
  "Platy",
  "Molly",
  "Angelfish",
  "Swordtail",
  "Zebra Danio",
  "Cherry Barb"
];

submitBtn.addEventListener('click', () => {
  const guessName = guessInput.value.trim();
  const guessedFish = fishData.find(f => f.name.toLowerCase() === guessName.toLowerCase());
  if (!guessedFish) return;
  
  checkGuess(guessedFish);
  
  guessInput.value = '';
});

// Dynamically add options to the datalist
fishNames.forEach(name => {
  const option = document.createElement('option');
  option.value = name;
  fishListElement.appendChild(option);
});

function checkGuess(guess) {
  const feedback = [];

  feedback.push({
    category: "Genus",
    result: compareValue(guess.genus, targetFish.genus)
  });

  feedback.push({
    category: "Diet",
    result: compareValue(guess.diet, targetFish.diet)
  });

  feedback.push({
    category: "Size",
    result: compareValue(guess.size, targetFish.size)
  });

  feedback.push({
    category: "Behavior",
    result: compareValue(guess.behavior, targetFish.behavior)
  });

  feedback.push({
    category: "Tank Level",
    result: compareValue(guess.tankLevel, targetFish.tankLevel)
  });

  renderFeedback(guess.name, feedback);
}

function compareValue(guessValue, targetValue) {
  if (guessValue === targetValue) return "correct";
  return "wrong";
}

function renderFeedback(name, feedback) {

  const row = document.createElement("div");
  row.className = "guess-row";

  const nameEl = document.createElement("strong");
  nameEl.textContent = name + ": ";
  row.appendChild(nameEl);

  feedback.forEach(f => {
    const span = document.createElement("span");
    span.textContent = `${f.category}: ${f.result}  `;
    span.className = f.result; // for styling
    row.appendChild(span);
  });

  resultsDiv.appendChild(row);
}


