const axios = require('axios');
const he = require('he'); // Add this to your package.json dependencies!

async function fetchImageMetadata(filename) {
  const title = `File:${filename}`;
  const url = 'https://commons.wikimedia.org/w/api.php';

  const params = {
    action: 'query',
    format: 'json',
    prop: 'imageinfo',
    titles: title,
    iiprop: 'url|user|extmetadata',
    origin: '*'
  };

  try {
    const { data } = await axios.get(url, { params });
    const pages = data.query.pages;
    const page = Object.values(pages)[0];

    if (!page || !page.imageinfo) return null;

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
    console.error("Failed to get image metadata:", err);
    return null;
  }
}

async function fetchFishFromWikidata() {
  const query = `
    SELECT ?fish ?scientificName ?commonName ?genusLabel ?familyLabel ?image ?maxLength WHERE {
      ?fish wdt:P225 "Betta splendens".           # Filter on scientific name here (can be parameterized later)
      OPTIONAL { ?fish wdt:P225 ?scientificName. }  # Scientific name (redundant but explicit)
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
    const results = [];

    for (const entry of response.data.results.bindings) {
      const scientificName = entry.scientificName?.value || "Betta splendens"; // fallback hardcoded
      const commonName = entry.commonName?.value || "";
      const genus = entry.genusLabel?.value || "";
      const family = entry.familyLabel?.value || "";
      const imageUrl = entry.image?.value || null;

      let imageData = null;
      if (imageUrl) {
        const filename = decodeURIComponent(imageUrl.split('/').pop());
        imageData = await fetchImageMetadata(filename);
      }

      results.push({
        scientificName,
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
    console.error("Error querying Wikidata:", err);
    return [];
  }
}

function sanitizeHTML(input) {
  if (!input) return "";
  // Remove HTML tags
  const tagStripped = input.replace(/<[^>]*>/g, "");
  // Decode HTML entities using he lib
  return he.decode(tagStripped).trim();
}

module.exports = { fetchFishFromWikidata };
