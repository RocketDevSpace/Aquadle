function arraysEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;
  // Compare sorted versions for order-independent equality
  const a1 = [...arr1].sort();
  const a2 = [...arr2].sort();
  return a1.every((val, idx) => val === a2[idx]);
}

// Helper to compare two fish objects by key Aquadle fields
function isFishDataEqual(fishA, fishB) {
  // Compare scientificName and commonName separately (handled by main)

  // Compare key fields (adjust these keys to your normalized format)
  const keysToCompare = [
    "locations",
    "regions",
    "max_size_category",
    "diet",
    "temperature_zones",
    "ph_zones",
    "hardness_zones",
    "tank_level",
    "behavior",
    "breeding_type",
  ];

  for (const key of keysToCompare) {
    const valA = fishA[key];
    const valB = fishB[key];

    if (Array.isArray(valA) && Array.isArray(valB)) {
      if (!arraysEqual(valA, valB)) return false;
    } else {
      // String or primitive comparison (normalize case and trim)
      if ((valA || "").toString().toLowerCase().trim() !== (valB || "").toString().toLowerCase().trim()) {
        return false;
      }
    }
  }
  return true;
}

// Main dedupe function
function dedupeFishData(fishArray) {
  const uniqueFish = [];
  const seenScientific = new Set();
  const seenCommon = new Set();

  for (const fish of fishArray) {
    // Skip if scientificName or commonName already seen
    if (fish.scientificName && seenScientific.has(fish.scientificName.toLowerCase())) {
      // console.log(`Skipping duplicate scientificName: ${fish.scientificName}`);
      continue;
    }
    if (fish.commonName && seenCommon.has(fish.commonName.toLowerCase())) {
      // console.log(`Skipping duplicate commonName: ${fish.commonName}`);
      continue;
    }

    // Check if this fish matches any fish in uniqueFish by Aquadle data
    const duplicate = uniqueFish.find(existingFish => isFishDataEqual(existingFish, fish));

    if (duplicate) {
      console.log(`Skipping data duplicate for fish: ${fish.scientificName || fish.commonName}`);
      continue; // skip duplicates by data
    }

    // Not duplicate - add to unique lists and push
    if (fish.scientificName) seenScientific.add(fish.scientificName.toLowerCase());
    if (fish.commonName) seenCommon.add(fish.commonName.toLowerCase());
    uniqueFish.push(fish);
  }

  return uniqueFish;
}

module.exports = { dedupeFishData };
