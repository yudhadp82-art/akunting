
const axios = require('axios');

async function scrape() {
  try {
    const response = await axios.get('https://simpanan-anggota.vercel.app/');
    const html = response.data;
    
    // Look for __NEXT_DATA__
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
    if (nextDataMatch) {
      console.log('--- __NEXT_DATA__ found ---');
      console.log(nextDataMatch[1].substring(0, 5000));
    } else {
      console.log('--- __NEXT_DATA__ not found ---');
    }
    
    // Look for other script data
    const scriptData = html.match(/<script>(.*?)<\/script>/g);
    if (scriptData) {
      console.log(`--- Found ${scriptData.length} script tags ---`);
      scriptData.forEach((s, i) => {
        if (s.includes('members') || s.includes('savings') || s.includes('data')) {
          console.log(`Script ${i}:`, s.substring(0, 500));
        }
      });
    }
  } catch (error) {
    console.error('Error scraping:', error.message);
  }
}

scrape();
