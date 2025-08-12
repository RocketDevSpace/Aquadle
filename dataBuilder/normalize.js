const ZONE_ORDER = {
  temperature: ["Cold", "Cool", "Temperate", "Warm", "Hot"],
  ph: ["Acidic", "Slightly Acidic", "Neutral", "Slightly Alkaline", "Alkaline"],
  hardness: ["Soft", "Moderately Soft", "Moderate", "Moderately Hard", "Hard"]
};

// Your existing helpers from before (parseZones, phToCategoryIndex, etc.) assumed present here

function normalizeTankLevel(tankLevelStr) {
  if (!tankLevelStr) return null;
  const validLevels = ["Top", "Middle", "Bottom", "All Levels"];
  let cleaned = tankLevelStr.replace(/\s*-\s*/g, "-").replace(/\s*,\s*/g, ",").trim();
  let parts = cleaned.split(/[-&,]/).map(s => s.trim()).filter(Boolean);
  let validParts = [];
  for (let part of parts) {
    if (validLevels.includes(part)) validParts.push(part);
    else console.warn(`⚠ Unknown tank level "${part}" in "${tankLevelStr}"`);
  }
  validParts = [...new Set(validParts)];
  if (validParts.length > 1) return "All Levels";
  if (validParts.length === 1) return validParts[0];
  return null;
}

function sizeCategory(cm) {
  if (cm <= 2) return "Nano";
  if (cm <= 5) return "Small";
  if (cm <= 15) return "Medium";
  if (cm <= 30) return "Large";
  if (cm <= 60) return "Giant";
  return "Monster";
}

function parseSizeCm(sizeStr) {
  const match = sizeStr.match(/([\d.]+)/);
  if (!match) return 0;
  return parseFloat(match[1]);
}

function parseZones(rangeStr, categories, toIndexFn) {
  if (!rangeStr) return [];
  const nums = rangeStr.match(/(\d+\.?\d*)/g);
  if (!nums || nums.length < 2) return [];
  const low = parseFloat(nums[0]);
  const high = parseFloat(nums[1]);
  const lowIndex = toIndexFn(low);
  const highIndex = toIndexFn(high);
  const zones = [];
  for (let i = lowIndex; i <= highIndex; i++) {
    zones.push(categories[i]);
  }
  return zones;
}

function temperatureToCategoryIndex(tempF) {
  if (tempF < 50) return 0;
  if (tempF < 60) return 1;
  if (tempF < 70) return 2;
  if (tempF < 80) return 3;
  return 4;
}

function phToCategoryIndex(ph) {
  if (ph < 6) return 0;
  if (ph < 6.5) return 1;
  if (ph <= 7.5) return 2;
  if (ph <= 8) return 3;
  return 4;
}

function hardnessToCategoryIndex(hardness) {
  if (hardness < 4) return 0;
  if (hardness < 8) return 1;
  if (hardness < 12) return 2;
  if (hardness < 20) return 3;
  return 4;
}

function parseBroaderRegions(regionArray) {
  if (!regionArray || regionArray.length === 0) return ["Unknown"];

  // Map countries to continents (expand as needed)
  const regionMap = {
    Tanzania: "Africa",
    Burundi: "Africa",
    "Democratic Republic of the Congo": "Africa",
    Zambia: "Africa",
    Malawi: "Africa",
    Brazil: "South America",
    Peru: "South America",
    Argentina: "South America",
    Paraguay: "South America",
    Venezuela: "South America",
    Colombia: "South America",
    China: "Asia",
    Vietnam: "Asia",
    Thailand: "Asia",
    Japan: "Asia",
    Philippines: "Asia",
    India: "Asia",
    Bangladesh: "Asia",
    Guinea: "Africa",
  };

  const broaderSet = new Set();
  for (const place of regionArray) {
    broaderSet.add(regionMap[place] || place);
  }

  if (broaderSet.size === 0) broaderSet.add("Unknown");

  return [...broaderSet];
}

function normalizeFishData(fish) {
  const sizeCm = parseSizeCm(fish.size);
  const maxSizeCategory = sizeCategory(sizeCm);

  // Locations as array (assumed already split in your input)
  const locations = Array.isArray(fish.region) ? fish.region : [];

  return {
    scientificName: fish.scientificName,
    genus: fish.genus,
    family: fish.family,
    commonName: fish.commonName || fish.name || null,
    locations,
    regions: parseBroaderRegions(locations),
    behavior: [
      fish.temperament,
      fish.shoaling && fish.shoaling.toLowerCase() === "yes" ? "Shoaling" : null
    ].filter(Boolean),
    breeding_type: fish.reproduction || null,
    diet: fish.diet || null,
    image: fish.image || null,
    max_size_category: maxSizeCategory,
    tank_level: normalizeTankLevel(fish.tankLevel),
    temperature_zones: parseZones(fish.temperatureF, ZONE_ORDER.temperature, temperatureToCategoryIndex),
    ph_zones: parseZones(fish.pH, ZONE_ORDER.ph, phToCategoryIndex),
    hardness_zones: parseZones(fish.hardness, ZONE_ORDER.hardness, hardnessToCategoryIndex)
  };
}

module.exports = { normalizeFishData };