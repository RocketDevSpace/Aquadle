const fs = require('fs');
const { fetchFishFromWikidata } = require('./wikidata');
const { fetchFishFromAquadiction } = require('./aquadiction');
const { normalizeFishData } = require('./normalize');
const { fetchSpeciesList } = require('./fetchSpeciesList');

async function main() {

  (async () => {
    const speciesUrls = await fetchSpeciesList();
    console.log(`Found ${speciesUrls.length} species URLs.`);
    // You can now loop over speciesUrls to scrape individual species data
  })();
  
  const wikiFish = await fetchFishFromWikidata(); // e.g. [{ scientificName: "...", ... }]
  const aquaFish = await fetchFishFromAquadiction(); // e.g. [{ scientificName: "...", ... }]

  console.log("=== Wikipedia Data ===");
  wikiFish.forEach((fish, i) => {
    console.log(`Entry #${i}:`, fish.scientificName || fish.name || fish.species || fish);
  });

  console.log("\n=== Aquadiction Data ===");
  aquaFish.forEach((fish, i) => {
    console.log(`Entry #${i}:`, fish.scientificName || fish.name || fish.species || fish);
  });

  // Log all scientific names for easier matching visibility
  const wikiNames = wikiFish.map(f => (f.scientificName || "").toLowerCase());
  const aquaNames = aquaFish.map(f => (f.scientificName || "").toLowerCase());
  console.log("\nWikipedia scientific names:", wikiNames);
  console.log("Aquadiction scientific names:", aquaNames);

  // Find names in wiki but missing from aqua
  const missingInAqua = wikiNames.filter(name => !aquaNames.includes(name));
  if (missingInAqua.length) {
    console.warn("Warning: These scientific names from Wikipedia have NO match in Aquadiction:", missingInAqua);
  }

  // Find names in aqua but missing from wiki
  const missingInWiki = aquaNames.filter(name => !wikiNames.includes(name));
  if (missingInWiki.length) {
    console.warn("Warning: These scientific names from Aquadiction have NO match in Wikipedia:", missingInWiki);
  }

  // Now merge on scientificName safely
  const combined = wikiFish.map(wf => {
    const match = aquaFish.find(af => {
      // Defensive check to avoid undefined
      if (!af.scientificName || !wf.scientificName) return false;
      return af.scientificName.toLowerCase() === wf.scientificName.toLowerCase();
    });
    return match ? { ...wf, ...match } : wf;
  });

  console.log("\nMerged data preview:", combined);

  const normalizedFish = normalizeFishData(combined);

  fs.writeFileSync('./output/fish.json', JSON.stringify(normalizedFish, null, 2));
  console.log('Saved normalized fish data.');
}

main().catch(err => {
  console.error("Error running main script:", err);
});
