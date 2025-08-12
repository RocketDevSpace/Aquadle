const axios = require('axios');
const cheerio = require('cheerio');

async function fetchSpeciesList(maxPages = 83) {
  const baseUrl = 'https://aquadiction.world/species-spotlight/loadmore?page=';
  const speciesUrls = new Set();

  for (let page = 1; page <= maxPages; page++) {
    try {
      console.log(`Fetching species page ${page}...`);
      const { data } = await axios.get(baseUrl + page, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://aquadiction.world/species-spotlight/'
        }
      });

      const $ = cheerio.load(data);

      $('a').each((_, el) => {
        const href = $(el).attr('href');
        if (href && href.startsWith('/species-spotlight/')) {
          // Filter out loadmore or non-species links if needed
          speciesUrls.add(`https://aquadiction.world${href}`);
        }
      });

      // Optional: Break early if no new links found
      if ($('a').length === 0) {
        console.log('No more species links found, stopping early.');
        break;
      }

    } catch (err) {
      console.error(`Error fetching page ${page}:`, err.message);
      break;
    }
  }

  return Array.from(speciesUrls);
}

module.exports = { fetchSpeciesList };
