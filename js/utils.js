// utils.js

const ZONE_ORDER = {
  temperature: ["Cold", "Cool", "Temperate", "Warm", "Hot"],
  ph: ["Acidic", "Slightly Acidic", "Neutral", "Slightly Alkaline", "Alkaline"],
  hardness: ["Soft", "Moderately Soft", "Moderate", "Moderately Hard", "Hard"]
};

export function compareZoneRanges(guessZones, correctZones, category) {
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

  if (!guessIndices.length || !correctIndices.length) {
    console.warn("  One of the index lists is empty — falling back to gray/null");
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

export function formatZoneValue(value) {
  if (Array.isArray(value)) {
    return value.join(", ");
  } else if (typeof value === "string") {
    return value;
  } else {
    return "Unknown";
  }
}
