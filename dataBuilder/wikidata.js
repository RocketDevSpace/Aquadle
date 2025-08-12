const axios = require('axios');
const he = require('he');

async function fetchImageMetadata(filename) {
  const title = `File:${filename}`;
  const url = 'https://commons.wikimedia.org/w/api.php';

  const params = {
    action: 'query',
    format: 'json',
    prop: 'imageinfo',
    titles: title,
    iiprop: 'url|user|extmetadata',
    origin: '*',
  };

  try {
    const { data } = await axios.get(url, { params });
    const pages = data.query.pages;
    const page = Object.values(pages)[0];

    if (!page || !page.imageinfo) {
      console.warn(`No imageinfo found for file: ${filename}`);
      return null;
    }

    const info = page.imageinfo[0];
    const meta = info.extmetadata;

    return {
      imageUrl: info.url,
      credit: meta.Credit?.value || "",
      license: meta.LicenseShortName?.value || "",
      licenseUrl: meta.LicenseUrl?.value || "",
      artist: meta.Artist?.value || "",
      attributionRequired: meta.AttributionRequired?.value === "true"
    };
  } catch (err) {
    console.error(`Failed to get image metadata for ${filename}:`, err.message);
    return null;
  }
}

/**
 * Fetch fish data from Wikidata given a scientific name.
 * Currently hardcoded for "Betta splendens" but can be parameterized.
 * Returns an array (possibly empty) of fish objects with enriched data.
 */
async function fetchFishFromWikidata(aquadictionName = "Betta splendens") {
  console.log(`Cleansing name: "${aquadictionName}"`)
  const scientificName = cleanScientificName(aquadictionName);
  console.log(`Querying Wikidata for scientific name: "${scientificName}"`);

  const query = `
    SELECT ?fish ?scientificName ?commonName ?genusLabel ?familyLabel ?image ?maxLength WHERE {
      ?fish wdt:P225 "${scientificName}".

      OPTIONAL { ?fish wdt:P225 ?scientificName. }
      OPTIONAL { ?fish rdfs:label ?commonName FILTER (LANG(?commonName) = "en") . }
      OPTIONAL { ?fish wdt:P18 ?image. }
      OPTIONAL { ?fish wdt:P2048 ?maxLength. }
      OPTIONAL {
        ?fish wdt:P171* ?genus .
        ?genus wdt:P105 wd:Q34740. # taxon rank genus
      }
      OPTIONAL {
        ?fish wdt:P171* ?family .
        ?family wdt:P105 wd:Q35409. # taxon rank family
      }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    }
    LIMIT 1
  `;

  const url = 'https://query.wikidata.org/sparql';
  const headers = { Accept: 'application/sparql-results+json' };

  try {
    const response = await axios.get(url, { params: { query }, headers });
    const bindings = response.data.results.bindings;

    if (!bindings.length) {
      console.warn(`No Wikidata results found for scientific name: "${scientificName}"`);
      return [];
    }

    const results = [];

    for (const entry of bindings) {
      const sciName = entry.scientificName?.value || scientificName;
      const commonName = entry.commonName?.value || "";
      const genus = entry.genusLabel?.value || "";
      const family = entry.familyLabel?.value || "";
      const imageUrl = entry.image?.value || null;

      console.log(`Wikidata entry found: scientificName="${sciName}", commonName="${commonName}"`);

      let imageData = null;
      if (imageUrl) {
        const filename = decodeURIComponent(imageUrl.split('/').pop());
        console.log(`Fetching image metadata for: ${filename}`);
        imageData = await fetchImageMetadata(filename);
        if (!imageData) {
          console.warn(`No image metadata found for ${filename}`);
        }
      } else {
        console.log('No image URL found for this entry.');
      }

      results.push({
        scientificName: sciName,
        name: commonName,
        genus,
        family,
        image: imageData ? {
          url: imageData.imageUrl,
          credit: sanitizeHTML(imageData.credit),
          license: imageData.license,
          licenseUrl: imageData.licenseUrl,
          artist: sanitizeHTML(imageData.artist)
        } : null
      });
    }

    return results;
  } catch (err) {
    console.error(`Error querying Wikidata for "${scientificName}":`, err.message);
    return [];
  }
}

function cleanScientificName(name) {
  if (!name) return "";
  console.log(`Cleaning scientific name: "${name}"`);

  let cleaned = name;

  // Remove anything in quotes (nicknames)
  cleaned = cleaned.replace(/["'“”‘’].*?["'“”‘’]/g, '');

  // Remove 'sp.', 'var.', 'cf.' suffixes INCLUDING trailing dot and spaces
  cleaned = cleaned.replace(/\b(sp|var|cf)\.?\s*/gi, '');

  // Remove any leftover trailing dots or commas or spaces
  cleaned = cleaned.replace(/[.,\s]+$/, '');

  // Collapse multiple spaces to single space and trim
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  console.log(`Cleaned scientific name: "${cleaned}"`);
  return cleaned;
}



function sanitizeHTML(input) {
  if (!input) return "";
  // Remove HTML tags
  const tagStripped = input.replace(/<[^>]*>/g, "");
  // Decode HTML entities using he lib
  return he.decode(tagStripped).trim();
}

module.exports = { fetchFishFromWikidata };
