const fs = require('fs');
const { fetchFishFromWikidata } = require('./wikidata');
const { fetchFishFromAquadiction } = require('./aquadiction');
const { normalizeFishData } = require('./normalize');
const { fetchSpeciesList } = require('./fetchSpeciesList');
const { dedupeFishData } = require('./dedupe');

async function main() {
  try {
    const speciesUrls = await fetchSpeciesList();
    console.log(`Found ${speciesUrls.length} species URLs.`);

    const combinedResults = [];
    const missingScientificNames = [];
    const missingImages = [];

    for (const url of speciesUrls) {
      console.log(`\nProcessing species URL: ${url}`);

      const aqDataArray = await fetchFishFromAquadiction(url);

      if (!aqDataArray || aqDataArray.length === 0) {
        console.warn('No data from Aquadiction, skipping this species.');
        continue;
      }

      const aqData = aqDataArray[0]; // <-- get the actual fish object

      console.log(`Aquadiction common name: ${aqData.commonName || 'UNKNOWN'}`);
      console.log(`Aquadiction scientific name: ${aqData.scientificName || 'UNKNOWN'}`);

      if (!aqData.scientificName) {
        missingScientificNames.push(aqData.commonName || url);
        console.warn('No scientific name found, skipping Wikidata fetch.');
        continue;
      }

      // Fetch Wikidata info by scientific name
      const wikiData = await fetchFishFromWikidata(aqData.scientificName);
      if (!wikiData || wikiData.length === 0) {
        missingScientificNames.push(aqData.scientificName || url);
        console.warn(`No Wikidata found for ${aqData.scientificName}, skipping.`);
        continue;
      }

      const hasImage = wikiData.some(fish => fish.image && fish.image.url);
      if (!hasImage) {
        missingImages.push(aqData.scientificName);
        console.warn(`Wikidata results found but no images for: ${aqData.scientificName}`);
        continue;
      }
      
      const wf = wikiData[0];
      console.log(`Wikidata scientific name: ${wf.scientificName || 'UNKNOWN'}`);

      // Merge both data objects - Wikipedia data overwrites Aquadiction where keys overlap
      const merged = { ...aqData, ...wf };

      combinedResults.push(merged);
    }

    console.log(`\nProcessed ${combinedResults.length} species.`);

    const normalizedFish = combinedResults.map(fish => normalizeFishData(fish));
    console.log(`Normalized ${normalizedFish.length} fish.`);
    
    const dedupedFish = dedupeFishData(normalizedFish);
    console.log(`Deduplicated to ${dedupedFish.length} fish.`);

    fs.writeFileSync('./output/fish.json', JSON.stringify(dedupedFish, null, 2));
    console.log("\n--- Species not found on Wikipedia ---");
    console.log(missingScientificNames);

    console.log("\n--- Species missing Wikipedia images ---");
    console.log(missingImages);
    
    console.log('Saved normalized fish data.');
  } catch (err) {
    console.error('Error running main script:', err);
  }
}

main();