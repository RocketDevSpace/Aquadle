const guessInput = document.getElementById('guess-input');
const submitBtn = document.getElementById('submit-btn');
const guessGrid = document.getElementById('guess-grid');
const resultMessage = document.getElementById('result-message');
const fishListElement = document.getElementById('fish-list');

// Placeholder target
const targetFish = "Betta";

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
  const guess = guessInput.value.trim();
  if (!guess) return;

  const isCorrect = guess.toLowerCase() === targetFish.toLowerCase();
  const result = document.createElement('div');
  result.textContent = `Guess: ${guess} - ${isCorrect ? "✅ Correct!" : "❌ Try again"}`;
  result.className = isCorrect ? "correct" : "wrong";

  guessGrid.appendChild(result);

  if (isCorrect) {
    resultMessage.textContent = "You win! 🎉";
    submitBtn.disabled = true;
  }

  guessInput.value = '';
});

// Dynamically add options to the datalist
fishNames.forEach(name => {
  const option = document.createElement('option');
  option.value = name;
  fishListElement.appendChild(option);
});
