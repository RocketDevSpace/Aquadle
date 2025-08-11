const axios = require('axios');
const cheerio = require('cheerio');

async function fetchFishFromAquadiction(url = 'https://aquadiction.world/species-spotlight/siamese-fighting-fish/') {
  console.log(`Fetching Aquadiction page: ${url}`);

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      },
    });

    const html = response.data;
    console.log('Page fetched successfully, length:', html.length);

    const $ = cheerio.load(html);

    const tables = $('table');
    console.log(`Found ${tables.length} <table> elements on the page.`);

    // We'll parse each table separately

    // 1. Quick Facts (general info)
    const quickFactsTable = tables.eq(0);
    const quickFactsData = {};
    quickFactsTable.find('tbody tr').each((index, row) => {
      const key = $(row).find('th').text().trim();
      const value = $(row).find('td').text().trim();
      if (key && value) {
        quickFactsData[key] = value;
      }
    });
    console.log('Quick Facts extracted:', quickFactsData);

    // 2. Water Parameters (pH, hardness, etc)
    const waterParamsTable = tables.eq(1);
    const waterParamsData = {};
    waterParamsTable.find('tbody tr').each((index, row) => {
      const key = $(row).find('th').text().trim();
      const value = $(row).find('td').text().trim();
      if (key && value) {
        waterParamsData[key] = value;
      }
    });
    console.log('Water Parameters extracted:', waterParamsData);

    // 3. Temperature Range
    const tempTable = tables.eq(2);
    const tempData = {};
    tempTable.find('tbody tr').each((index, row) => {
      const key = $(row).find('th').text().trim();
      const value = $(row).find('td').text().trim();
      if (key && value) {
        tempData[key] = value;
      }
    });
    console.log('Temperature Data extracted:', tempData);

    // Now build the final filtered object with only the relevant keys:
    // Map keys from Aquadiction to consistent camelCase field names

    const fishData = {
        scientificName: quickFactsData['Scientific Name'] || 'Unknown',
        commonName: quickFactsData['Other Names'] || null,
        region: cleanOrigin(quickFactsData['Origins']) || null,
        size: quickFactsData['Approx Max Size'] || null,
        tankLevel: quickFactsData['Aquarium Level'] || null,
        temperament: quickFactsData['Temperament'] || null,
        shoaling: quickFactsData['Shoaling'] || null,
        reproduction: quickFactsData['Reproduction'] || null,
        diet: quickFactsData['Diet & Feeding'] || null,
        temperatureF: tempData['℉'] || null,
        temperatureC: tempData['℃'] || null,
        pH: waterParamsData['pH'] || null,
        hardness: waterParamsData['GH'] || null,
    };

    console.log('Filtered fish data:', fishData);

    return [fishData];
  } catch (err) {
    console.error('Error fetching or parsing Aquadiction page:', err);
    return [];
  }
}
function cleanOrigin(originStr) {
  if (!originStr) return null;

  // Replace all whitespace (spaces, tabs, newlines) with a single space
  let cleaned = originStr.replace(/\s+/g, ' ').trim();

  // Now split on single spaces since original separators are just whitespace
  let parts = cleaned.split(' ').filter(Boolean);

  // Group consecutive parts into multi-word place names by detecting uppercase start:
  // For example "South America" is two words, we want to keep them together.
  // But your data seems like single words (countries), so we can just join by commas for now.

  return parts.join(', ');
}




module.exports = { fetchFishFromAquadiction };
