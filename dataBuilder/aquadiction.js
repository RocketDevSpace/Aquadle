const axios = require('axios');
const cheerio = require('cheerio');

async function fetchFishFromAquadiction(url) {
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

    if (tables.length < 3) {
      console.warn('Warning: Expected at least 3 tables but found less.');
    }

    // Parse Quick Facts table
    const quickFactsTable = tables.eq(0);
    const quickFactsData = {};
    quickFactsTable.find('tbody tr').each((_, row) => {
      const key = $(row).find('th').text().trim();
      const value = $(row).find('td').text().trim();
      if (key) {
        quickFactsData[key] = value || null;
      }
    });
    console.log('Quick Facts extracted:', quickFactsData);

    // Parse Water Parameters table
    const waterParamsTable = tables.eq(1);
    const waterParamsData = {};
    waterParamsTable.find('tbody tr').each((_, row) => {
      const key = $(row).find('th').text().trim();
      const value = $(row).find('td').text().trim();
      if (key) {
        waterParamsData[key] = value || null;
      }
    });
    console.log('Water Parameters extracted:', waterParamsData);

    // Parse Temperature Range table
    const tempTable = tables.eq(2);
    const tempData = {};
    tempTable.find('tbody tr').each((_, row) => {
      const key = $(row).find('th').text().trim();
      const value = $(row).find('td').text().trim();
      if (key) {
        tempData[key] = value || null;
      }
    });
    console.log('Temperature Data extracted:', tempData);

    // Build filtered fish data with consistent keys
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

  // Remove leading/trailing whitespace and normalize multiple spaces
  let cleaned = originStr.trim();

  // Split on 2+ spaces
  let parts = cleaned
    .split(/\s{2,}/) // <-- matches 2 or more spaces
    .map(part => part.trim())
    .filter(Boolean);

  return parts;
}


module.exports = { fetchFishFromAquadiction };
