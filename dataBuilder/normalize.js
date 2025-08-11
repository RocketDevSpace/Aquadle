// normalize.js

const temperatureZones = [
  { name: 'cold', min: 0, max: 19 },
  { name: 'medium', min: 20, max: 25 },
  { name: 'warm', min: 26, max: 40 },
];

const pHZones = [
  { name: 'acidic', min: 0, max: 6.5 },
  { name: 'neutral', min: 6.5, max: 7.5 },
  { name: 'alkaline', min: 7.5, max: 14 },
];

const hardnessZones = [
  { name: 'soft', min: 0, max: 60 },
  { name: 'moderate', min: 61, max: 120 },
  { name: 'hard', min: 121, max: 180 },
];

const sizeZones = [
  { name: 'small', maxInches: 3 },
  { name: 'medium', maxInches: 7 },
  { name: 'large', maxInches: 15 },
  { name: 'very large', maxInches: 100 },
];

// Map countries to broader regions — add more as you discover
const regionMap = {
  Cambodia: 'Southeast Asia',
  Laos: 'Southeast Asia',
  Vietnam: 'Southeast Asia',
  Thailand: 'Southeast Asia',
  Brazil: 'South America',
  Peru: 'South America',
  Colombia: 'South America',
  // ...
};

function parseRange(rangeStr) {
  if (!rangeStr) return null;
  const parts = rangeStr.split('-').map(p => parseFloat(p.trim()));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return { min: parts[0], max: parts[1] };
  } else if (!isNaN(parts[0])) {
    return { min: parts[0], max: parts[0] };
  }
  return null;
}

function assignZones(range, zones) {
  if (!range) return [];
  return zones
    .filter(zone => !(range.max < zone.min || range.min > zone.max))
    .map(zone => zone.name);
}

function cmToInches(cm) {
  return cm / 2.54;
}

function assignSizeZone(inches) {
  for (const zone of sizeZones) {
    if (inches <= zone.maxInches) return zone.name;
  }
  return 'unknown';
}

function parseSize(sizeStr) {
  if (!sizeStr) return null;
  const match = sizeStr.match(/([\d.]+)\s*cm/i);
  if (!match) return null;
  const cm = parseFloat(match[1]);
  const inches = cmToInches(cm);
  return { cm, inches, zone: assignSizeZone(inches) };
}

function mapRegions(originsStr) {
  if (!originsStr) return [];
  const countries = originsStr.split(',').map(s => s.trim());
  const regions = new Set();
  for (const country of countries) {
    if (regionMap[country]) regions.add(regionMap[country]);
    else regions.add('Unknown');
  }
  return Array.from(regions);
}

function normalizeFishData(fishArray) {
  return fishArray.map(fish => {
    const tempRangeC = parseRange(fish.temperatureC);
    const tempZones = assignZones(tempRangeC, temperatureZones);

    const pHRange = parseRange(fish.pH);
    const pHZonesAssigned = assignZones(pHRange, pHZones);

    const hardnessRange = parseRange(fish.hardness);
    const hardnessZonesAssigned = assignZones(hardnessRange, hardnessZones);

    const sizeData = parseSize(fish.size);

    const broaderRegions = mapRegions(fish.region);

    return {
      ...fish,
      normalized: {
        temperatureZones: tempZones,
        pHZones: pHZonesAssigned,
        hardnessZones: hardnessZonesAssigned,
        size: sizeData,
        broaderRegions: broaderRegions,
      }
    };
  });
}

module.exports = { normalizeFishData };
