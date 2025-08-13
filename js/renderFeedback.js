// renderFeedback.js
import { formatZoneValue } from './utils.js';

// Optional: move this to a constants.js if needed
const categoryOrder = [
  { key: "commonName", label: "Name"}, 
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

export function renderFeedback(guess, feedback) {
  const feedbackElement = document.getElementById("feedback-grid");

  const feedbackRow = document.createElement("div");
  feedbackRow.classList.add("feedback-row");

  // Category cells
  categoryOrder.forEach(({ key }) => {
    const cell = document.createElement("div");
    cell.classList.add("feedback-box");

    let displayValue = "";
    let colorClass = "gray";

    if (key === "genus_family") {
      displayValue = `${guess.genus}\n(${guess.family})`;
      colorClass = feedback[key];
      
    } else if (["temperature", "ph", "hardness", "max_size_category"].includes(key)) {
      const guessValue = key === "max_size_category"
        ? guess[key]
        : guess[`${key}_zones`] || [];


      const fb = feedback[key];
      if (typeof fb === "object" && fb !== null) {
        displayValue = `${formatZoneValue(guessValue)} ${fb.direction || ""}`.trim();
        colorClass = fb.color || "gray";
      } else {
        displayValue = formatZoneValue(guessValue);
        colorClass = fb || "gray";
      }
    } else if (key === "habitat_origin") {
        const regions = Array.isArray(guess.regions) && guess.regions.length > 0 ? guess.regions.join(", ") : "Unknown";
        const locations = Array.isArray(guess.locations) ? guess.locations : [];
        displayValue = locations.length > 0
          ? `${regions} / ${locations.join(", ")}`
          : regions;
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
    feedbackRow.appendChild(cell);
  });

  // Insert just after the header row
  const headerRow = feedbackElement.querySelector(".header-row");
  if (headerRow && headerRow.parentNode === feedbackElement) {
    if (headerRow.nextSibling) {
      feedbackElement.insertBefore(feedbackRow, headerRow.nextSibling);
    } else {
      feedbackElement.appendChild(feedbackRow);
    }
  } else {
    feedbackElement.appendChild(feedbackRow);
  }
}

export function generateCategoryHeader(container) {
  const categories = [
    "Name",
    "Genus / Family",
    "Diet",
    "Behavior",
    "Habitat",
    "Tank Level",
    "Breeding Type",
    "Max Size",
    "Temperature",
    "pH",
    "Hardness"
  ];

  // Clear any existing header
  container.innerHTML = "";

  const headerRow = document.createElement("div");
  headerRow.classList.add("feedback-row", "header-row");

  categories.forEach(category => {
    const cell = document.createElement("div");
    cell.classList.add("feedback-box", "header-box");
    cell.textContent = category;
    headerRow.appendChild(cell);
  });

  container.appendChild(headerRow);
}
