// checkGuess.js
import { compareZoneRanges } from './utils.js';

export function checkGuess(userGuess, targetFish) {
  const feedback = {};

  // Name (exact match only)
  feedback.commonName = userGuess.commonName === targetFish.commonName ? "green" : "gray";
  
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
  function arraysOverlap(arr1, arr2) {
    if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false;
    return arr1.some(item => arr2.includes(item));
  }

  const userRegions = userGuess.regions || [];
  const targetRegions = targetFish.regions || [];
  const userLocations = userGuess.locations || [];
  const targetLocations = targetFish.locations || [];

  const regionsMatchFull = userRegions.length && targetRegions.length && userRegions.every(r => targetRegions.includes(r)) && targetRegions.every(r => userRegions.includes(r));
  const regionsOverlapPartial = arraysOverlap(userRegions, targetRegions);

  const locationsMatchFull = userLocations.length && targetLocations.length && userLocations.every(l => targetLocations.includes(l)) && targetLocations.every(l => userLocations.includes(l));
  const locationsOverlapPartial = arraysOverlap(userLocations, targetLocations);

  if (regionsMatchFull && locationsMatchFull) {
    feedback.habitat_origin = "green";
  } else if (regionsMatchFull && !locationsMatchFull) {
    feedback.habitat_origin = "yellow";
  } else if (regionsOverlapPartial || locationsOverlapPartial) {
    feedback.habitat_origin = "yellow";
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
