const guessInput = document.getElementById("guess-input");
const submitBtn = document.getElementById("submit-btn");
const guessGrid = document.getElementById("guess-grid");
const resultMessage = document.getElementById("result-message");
const resultsDiv = document.getElementById("results");

const ZONE_ORDER = {
  temperature: ["cold", "cool", "moderate", "warm", "hot"],
  ph: ["acidic", "slightly acidic", "neutral", "slightly alkaline", "alkaline"],
  hardness: ["soft", "moderately soft", "moderate", "moderately hard", "hard"]
};

let fishData = [];
let targetFish = null;

fetch("fish.json")
  .then((response) => response.json())
  .then((data) => {
    fishData = data;

    // Choose a random fish once data is loaded
    targetFish = fishData[Math.floor(Math.random() * fishData.length)];

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

  checkGuess(guessedFish);

  guessInput.value = "";
});

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
  feedback.species_type = userGuess.species_type === targetFish.species_type ? "green" : "gray";

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
  const behaviorMatch = userGuess.behavior.filter(tag => targetFish.behavior.includes(tag));
  feedback.behavior = behaviorMatch.length > 0
      ? (behaviorMatch.length === targetFish.behavior.length ? "green" : "yellow")
      : "gray";

  // Habitat Origin (regional match)
  if (userGuess.region === targetFish.region) {
    if (targetFish.location && userGuess.location === targetFish.location) {
        feedback.habitat_origin = "green"; // exact match
    } else {
        feedback.habitat_origin = "yellow"; // same region, different or missing location
    }
  } else {
    feedback.habitat_origin = "gray"; // different region
  }

  // Tank Level (exact only, no yellow)
  feedback.tank_level = userGuess.tank_level === targetFish.tank_level ? "green" : "gray";

  // Breeding Type (exact only)
  feedback.breeding_type = userGuess.breeding_type === targetFish.breeding_type ? "green" : "gray";

  // Max Size (range with arrows)
  const sizeCategories = ["Nano", "Small", "Medium", "Large", "Giant", "Monster"];
  const guessIndex = sizeCategories.indexOf(userGuess.max_size_category);
  const answerIndex = sizeCategories.indexOf(targetFish.max_size_category);
  if (guessIndex === answerIndex) {
      feedback.max_size_category = "green";
  } else {
      feedback.max_size_category = {
          color: "gray",
          direction: guessIndex < answerIndex ? "↑" : "↓"
      };
  }
  
  feedback.temperature = compareZoneRanges(userGuess.temperature_zones, targetFish.temperature_zones, "temperature");
  feedback.ph = compareZoneRanges(userGuess.ph_zones, targetFish.ph_zones, "ph");
  feedback.hardness = compareZoneRanges(userGuess.hardness_zones, targetFish.hardness_zones, "hardness");

  renderFeedback(userGuess, feedback);
}

function compareZoneRanges(guessZones, correctZones, category) {
  const order = ZONE_ORDER[category];
  if (!order) {
    console.warn(`Unknown category: ${category}`);
    return { status: "gray", direction: null };
  }

  // Convert zones to index ranges
  const guessIndices = guessZones.map(z => order.indexOf(z)).filter(i => i !== -1);
  const correctIndices = correctZones.map(z => order.indexOf(z)).filter(i => i !== -1);

  if (!guessIndices.length || !correctIndices.length) {
    return { status: "gray", direction: null };
  }

  const guessMin = Math.min(...guessIndices);
  const guessMax = Math.max(...guessIndices);
  const correctMin = Math.min(...correctIndices);
  const correctMax = Math.max(...correctIndices);

  const overlap = !(guessMax < correctMin || guessMin > correctMax);

  if (guessMin === correctMin && guessMax === correctMax) {
    return { status: "green", direction: null };
  } else if (overlap) {
    return { status: "yellow", direction: null };
  } else if (guessMax < correctMin) {
    return { status: "gray", direction: "↑" }; // Guess is too low
  } else {
    return { status: "gray", direction: "↓" }; // Guess is too high
  }
}


function renderFeedback(guess, feedback) {
  const feedbackContainer = document.createElement("div");
  feedbackContainer.classList.add("feedback-row");

  const nameEl = document.createElement("div");
  nameEl.classList.add("fish-name");
  nameEl.textContent = guess.name;
  console.log('name: ' + guess.name);
  feedbackContainer.appendChild(nameEl);

  const categories = Object.keys(guess).filter(k => k !== "name");
  categories.forEach(category => {
    const box = document.createElement("div");
    box.classList.add("feedback-box");

    const label = document.createElement("span");
    label.classList.add("feedback-label");
    label.textContent = category;
    box.appendChild(label);

    const valueSpan = document.createElement("span");
    valueSpan.classList.add("feedback-value");

    const guessValue = guess[category];
    const feedbackValue = feedback[category];

    if (typeof feedbackValue === "object" && feedbackValue.status) {
      // Special case for zone-based feedback (temp, pH, hardness)
      valueSpan.textContent = `${formatZoneValue(displayValue)} ${feedbackValue.direction || ""}`;
      valueSpan.classList.add(feedbackValue.status);

    } else if (Array.isArray(guessValue)) {
      // Tag-style feedback
      valueSpan.textContent = guessValue.join(", ");
      if (typeof feedbackValue === "string") {
        valueSpan.classList.add(feedbackValue); // green/yellow/gray
      }

    } else {
      // Simple string values
      valueSpan.textContent = guessValue;
      if (typeof feedbackValue === "string") {
        valueSpan.classList.add(feedbackValue); // green/yellow/gray
      }
    }

    box.appendChild(valueSpan);
    feedbackContainer.appendChild(box);
  });

  document.getElementById("feedback").appendChild(feedbackContainer);
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
