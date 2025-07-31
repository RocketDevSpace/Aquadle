const guessInput = document.getElementById("guess-input");
const submitBtn = document.getElementById("submit-btn");
const guessGrid = document.getElementById("guess-grid");
const resultMessage = document.getElementById("result-message");
const resultsDiv = document.getElementById("results");
const resultsModal = document.getElementById("results-modal");
const closeResultsModalBtn = document.getElementById("close-results-modal");
const fishImageEl = document.getElementById("fish-image");
const fishNameEl = document.getElementById("fish-name");
const guessCountEl = document.getElementById("guess-count");
const showResultsModalBtn = document.getElementById("show-results-modal");

const ZONE_ORDER = {
  temperature: ["Cold", "Cool", "Moderate", "Warm", "Hot"],
  ph: ["Acidic", "Slightly Acidic", "Neutral", "Slightly Alkaline", "Alkaline"],
  hardness: ["Soft", "Moderately Soft", "Moderate", "Moderately Hard", "Hard"],
};

let fishData = [];
let targetFish = null;
let guessCount = 0;
let maxLives = 5;
let remainingLives = maxLives;

fetch("fish.json")
  .then((response) => response.json())
  .then((data) => {
    fishData = data;

    // Choose a random fish once data is loaded
    targetFish = fishData[Math.floor(Math.random() * fishData.length)];

    initializeLives();
    
    // Populate autocomplete list
    populateFishList(fishData);
  })
  .catch((error) => {
    console.error("Error loading fish data:", error);
  });

submitBtn.addEventListener("click", () => {
  const guessName = guessInput.value.trim();
  const guessedFish = fishData.find(
    (f) => f.name.toLowerCase() === guessName.toLowerCase(),
  );
  if (!guessedFish) return;

  guessCount++;
  checkGuess(guessedFish);
  guessInput.value = "";
});

function initializeLives() {
  const lifeContainer = document.getElementById("life-container");
  lifeContainer.innerHTML = ""; // Clear if restarting
  for (let i = 0; i < maxLives; i++) {
    const icon = document.createElement("div");
    icon.classList.add("life-icon");
    lifeContainer.appendChild(icon);
  }
}

renderFeedback({}, {}, true); // Header row

// Dynamically add options to the datalist
function populateFishList(data) {
  const fishListElement = document.getElementById("fish-list");
  fishListElement.innerHTML = ""; // Clear existing options

  data.forEach((fish) => {
    const option = document.createElement("option");
    option.value = fish.name;
    fishListElement.appendChild(option);
  });
}

function checkGuess(userGuess) {
  const feedback = {};

  // Species Type
  feedback.species_type =
    userGuess.species_type === targetFish.species_type ? "green" : "gray";

  // Genus / Family
  if (userGuess.genus === targetFish.genus) {
    feedback.genus_family = "green";
  } else if (userGuess.family === targetFish.family) {
    feedback.genus_family = "yellow";
  } else {
    feedback.genus_family = "gray";
  }

  // Diet (Exact match only)
  feedback.diet = userGuess.diet === targetFish.diet ? "green" : "gray";

  // Behavior (multi-tag overlap)
  const behaviorMatch = userGuess.behavior.filter((tag) =>
    targetFish.behavior.includes(tag),
  );
  feedback.behavior =
    behaviorMatch.length > 0
      ? behaviorMatch.length === targetFish.behavior.length
        ? "green"
        : "yellow"
      : "gray";

  // Habitat Origin (region + optional location)
  const userHasLocation = !!userGuess.location;
  const targetHasLocation = !!targetFish.location;

  if (userGuess.region === targetFish.region) {
    if (
      (userHasLocation &&
        targetHasLocation &&
        userGuess.location === targetFish.location) ||
      (!userHasLocation && !targetHasLocation)
    ) {
      feedback.habitat_origin = "green";
    } else {
      feedback.habitat_origin = "yellow";
    }
  } else {
    feedback.habitat_origin = "gray";
  }

  // Tank Level (exact only, no yellow)
  feedback.tank_level =
    userGuess.tank_level === targetFish.tank_level ? "green" : "gray";

  // Breeding Type (exact only)
  feedback.breeding_type =
    userGuess.breeding_type === targetFish.breeding_type ? "green" : "gray";

  // Max Size (range with arrows)
  const sizeCategories = [
    "Nano",
    "Small",
    "Medium",
    "Large",
    "Giant",
    "Monster",
  ];
  const guessIndex = sizeCategories.indexOf(userGuess.max_size_category);
  const answerIndex = sizeCategories.indexOf(targetFish.max_size_category);
  if (guessIndex === answerIndex) {
    feedback.max_size_category = { color: "green", direction: null };
  } else {
    feedback.max_size_category = {
      color: "gray",
      direction: guessIndex < answerIndex ? "↑" : "↓",
    };
  }

  feedback.temperature = compareZoneRanges(
    userGuess.temperature_zones,
    targetFish.temperature_zones,
    "temperature",
  );
  feedback.ph = compareZoneRanges(
    userGuess.ph_zones,
    targetFish.ph_zones,
    "ph",
  );
  feedback.hardness = compareZoneRanges(
    userGuess.hardness_zones,
    targetFish.hardness_zones,
    "hardness",
  );

  renderFeedback(userGuess, feedback);

  // Remove guessed option from the datalist
  const fishListElement = document.getElementById("fish-list");
  const guessedOption = Array.from(fishListElement.options).find(
    (opt) => opt.value.toLowerCase() === userGuess.name.toLowerCase(),
  );
  if (guessedOption) {
    fishListElement.removeChild(guessedOption);
  }

  if (userGuess.name.toLowerCase() === targetFish.name.toLowerCase()) {
    // Show win modal with info
    showResults(targetFish, guessCount, true); // You need to track guessCount somewhere
  } else {
    remainingLives--;
    updateLivesDisplay();

    if (remainingLives === 0) {
      showResults(targetFish, guessCount, false);
    }
  }
}

function updateLivesDisplay() {
  const icons = document.querySelectorAll(".life-icon");
  const used = maxLives - remainingLives;
  for (let i = 0; i < icons.length; i++) {
    icons[i].classList.toggle("lost", i < used);
  }
}


function compareZoneRanges(guessZones, correctZones, category) {
  const order = ZONE_ORDER[category];
  if (!order) {
    console.warn(`Unknown category: ${category}`);
    return { color: "gray", direction: null };
  }

  const guessIndices = guessZones
    .map((z) => order.indexOf(z))
    .filter((i) => i !== -1);
  const correctIndices = correctZones
    .map((z) => order.indexOf(z))
    .filter((i) => i !== -1);

  console.log(`Comparing ${category}:`);
  console.log("  Guess zones:", guessZones, "→ indices:", guessIndices);
  console.log("  Correct zones:", correctZones, "→ indices:", correctIndices);

  if (!guessIndices.length || !correctIndices.length) {
    console.warn(
      "  One of the index lists is empty — falling back to gray/null",
    );
    return { color: "gray", direction: null };
  }

  const guessMin = Math.min(...guessIndices);
  const guessMax = Math.max(...guessIndices);
  const correctMin = Math.min(...correctIndices);
  const correctMax = Math.max(...correctIndices);

  const overlap = !(guessMax < correctMin || guessMin > correctMax);

  if (guessMin === correctMin && guessMax === correctMax) {
    return { color: "green", direction: null };
  } else if (overlap) {
    return { color: "yellow", direction: null };
  } else if (guessMax < correctMin) {
    console.log("  Guess is too low ↑");
    return { color: "gray", direction: "↑" };
  } else {
    console.log("  Guess is too high ↓");
    return { color: "gray", direction: "↓" };
  }
}

function renderFeedback(guess, feedback, isHeader = false) {
  const feedbackElement = document.getElementById("feedback");

  const categoryOrder = [
    { key: "species_type", label: "Species" },
    { key: "genus_family", label: "Genus / Family" },
    { key: "diet", label: "Diet" },
    { key: "behavior", label: "Behavior" },
    { key: "habitat_origin", label: "Habitat" },
    { key: "tank_level", label: "Tank Level" },
    { key: "breeding_type", label: "Breeding" },
    { key: "max_size_category", label: "Size" },
    { key: "temperature", label: "Temperature" },
    { key: "ph", label: "pH" },
    { key: "hardness", label: "Hardness" },
  ];

  // Create the row container
  const feedbackRow = document.createElement("div");
  feedbackRow.classList.add("feedback-row");
  if (isHeader) feedbackRow.classList.add("feedback-header");

  // Name cell
  const nameCell = document.createElement("div");
  nameCell.classList.add("feedback-box");
  nameCell.textContent = isHeader ? "Name" : guess.name;
  if (isHeader) nameCell.classList.add("header-row");
  feedbackRow.appendChild(nameCell);

  // Category cells
  categoryOrder.forEach(({ key, label }) => {
    const cell = document.createElement("div");
    cell.classList.add("feedback-box");

    if (isHeader) {
      cell.textContent = label;
      cell.classList.add("header-row");
    } else {
      let displayValue = "";
      let colorClass = "gray";

      if (key === "genus_family") {
        displayValue = `${guess.genus}\n(${guess.family})`;
        colorClass = feedback[key];
      } else if (
        ["temperature", "ph", "hardness", "max_size_category"].includes(key) &&
        typeof feedback[key] === "object"
      ) {
        const guessValue =
          guess[key + (key === "max_size_category" ? "" : "_zones")] || [];
        const fb = feedback[key] || {};
        displayValue =
          `${formatZoneValue(guessValue)} ${fb.direction || ""}`.trim();
        colorClass = fb.color || "gray";
      } else if (key === "habitat_origin") {
        const region = guess.region || "Unknown";
        const location = guess.location || "";
        displayValue = location ? `${region} / ${location.join(", ")}` : region;
        colorClass = feedback[key];
      } else if (Array.isArray(guess[key])) {
        displayValue = guess[key].join(", ");
        colorClass = feedback[key];
      } else {
        displayValue = guess[key];
        colorClass = feedback[key];
      }

      cell.textContent = displayValue;
      cell.classList.add(colorClass);
    }

    feedbackRow.appendChild(cell);
  });

  // Insert header or guess row at the right position
  if (isHeader) {
    feedbackElement.appendChild(feedbackRow); // only one header, goes first
  } else {
    // Insert just after the header row (first child)
    const headerRow = feedbackElement.querySelector(".feedback-header");
    if (headerRow) {
      feedbackElement.insertBefore(feedbackRow, headerRow.nextSibling);
    } else {
      feedbackElement.appendChild(feedbackRow);
    }
  }
}

// Helper to format arrays of zone names or display a fallback
function formatZoneValue(value) {
  if (Array.isArray(value)) {
    return value.join(", ");
  } else if (typeof value === "string") {
    return value;
  } else {
    return "Unknown";
  }
}

function showResults(answer, guessesTaken, won = true) {
  const modal = document.getElementById("results-modal");
  const modalText = document.getElementById("fish-text");
  const modalInfo = document.getElementById("fish-info");
  const modalImage = document.getElementById("fish-image");

  modalText.textContent = won
    ? `You win! It was ${answer.name}!`
    : `Better luck next time! The correct answer was ${answer.name}.`;

  modalImage.src = answer.image || "https://via.placeholder.com/150";
  modalImage.style.display = "block";

  modalInfo.innerHTML = `
    <p><strong>Species:</strong> ${answer.name}</p>
    <p><strong>Genus:</strong> ${answer.genus}</p>
    <p><strong>Family:</strong> ${answer.family}</p>
    <p><strong>Diet:</strong> ${answer.diet}</p>
    <p><strong>Region:</strong> ${answer.region}</p>
    <p><strong>Location:</strong> ${Array.isArray(answer.location) ? answer.location.join(", ") : answer.location}</p>
    <p><strong>Behavior:</strong> ${answer.behavior.join(", ")}</p>
    <p><strong>Tank Level:</strong> ${answer.tank_level}</p>
    <p><strong>Breeding Type:</strong> ${answer.breeding_type}</p>
    <p><strong>Max Size:</strong> ${answer.max_size_category}</p>
    <p><strong>Temperature Zones:</strong> ${answer.temperature_zones.join(", ")}</p>
    <p><strong>pH Zones:</strong> ${answer.ph_zones.join(", ")}</p>
    <p><strong>Hardness Zones:</strong> ${answer.hardness_zones.join(", ")}</p>
    <p><strong>Guesses Taken:</strong> ${guessesTaken}</p>
  `;

  modal.classList.remove("hidden");
}


// Close modal handler
closeResultsModalBtn.addEventListener("click", () => {
  resultsModal.classList.add("hidden");
  showResultsModalBtn.style.display = "block";
});

showResultsModalBtn.addEventListener("click", () => {
  resultsModal.classList.remove("hidden");
});
