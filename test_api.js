import https from 'https';

const albumId = '9TP6hPU';
const clientIds = [
  '546c25a59c58ad7',
  '4e1d1e43689408e',
  'b02b5e0c50ca13d',
  'e5c1410f96befcb'
];

async function tryFetch(clientId) {
  return new Promise((resolve) => {
    const url = `https://api.imgur.com/3/album/${albumId}/images`;
    console.log(`Trying CID ${clientId} for URL ${url}`);
    
    const req = https.get(url, {
      headers: {
        'Authorization': `Client-ID ${clientId}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log(`CID ${clientId} - Status: ${res.statusCode}, Length: ${data.length}`);
        if (res.statusCode === 200) {
          try {
            const parsed = JSON.parse(data);
            if (parsed.success && parsed.data) {
              console.log(`SUCCESS with CID ${clientId}! Found ${parsed.data.length} images.`);
              resolve(parsed.data);
              return;
            }
          } catch (e) {
            console.log('Parse error:', e.message);
          }
        }
        resolve(null);
      });
    });
    
    req.on('error', (err) => {
      console.log(`CID ${clientId} error:`, err.message);
      resolve(null);
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      resolve(null);
    });
  });
}

async function run() {
  for (const cid of clientIds) {
    const images = await tryFetch(cid);
    if (images) {
      console.log('First 3 images:', JSON.stringify(images.slice(0, 3), null, 2));
      const hashes = images.map(img => img.id);
      console.log('ALL HASHES:', JSON.stringify(hashes));
      break;
    }
  }
}

run();
