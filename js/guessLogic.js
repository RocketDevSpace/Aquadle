// checkGuess.js
import { compareZoneRanges } from './utils.js';

export function checkGuess(userGuess, targetFish) {
  const feedback = {};

  // Name (exact match only)
  feedback.name = userGuess.name === targetFish.name ? "green" : "gray";
  
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
  const behaviorMatch = userGuess.behavior.filter(tag =>
    targetFish.behavior.includes(tag)
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
      (userHasLocation && targetHasLocation && userGuess.location === targetFish.location) ||
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
  const sizeCategories = ["Nano", "Small", "Medium", "Large", "Giant", "Monster"];
  const guessIndex = sizeCategories.indexOf(userGuess.max_size_category);
  const answerIndex = sizeCategories.indexOf(targetFish.max_size_category);
  if (guessIndex === answerIndex) {
    feedback.max_size_category = { color: "green", direction: null };
  } else {
    feedback.max_size_category = {
      color: "gray",
      direction: guessIndex < answerIndex ? "↑" : "↓"
    };
  }

  // Environmental zones
  feedback.temperature = compareZoneRanges(
    userGuess.temperature_zones,
    targetFish.temperature_zones,
    "temperature"
  );
  feedback.ph = compareZoneRanges(
    userGuess.ph_zones,
    targetFish.ph_zones,
    "ph"
  );
  
  feedback.hardness = compareZoneRanges(
    userGuess.hardness_zones,
    targetFish.hardness_zones,
    "hardness"
  );

  return feedback;
}
