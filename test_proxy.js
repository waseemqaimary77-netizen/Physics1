import https from 'https';
import fs from 'fs';

const albumId = '9TP6hPU';
const albumUrl = `https://imgur.com/a/${albumId}`;

const proxies = [
  `https://cors-anywhere.herokuapp.com/${albumUrl}`,
  `https://api.allorigins.win/get?url=${encodeURIComponent(albumUrl)}`,
  `https://corsproxy.io/?${encodeURIComponent(albumUrl)}`,
  `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(albumUrl)}`
];

async function tryProxy(proxyUrl) {
  return new Promise((resolve) => {
    console.log(`Querying proxy: ${proxyUrl}`);
    const req = https.get(proxyUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log(`Proxy status: ${res.statusCode}, length: ${data.length}`);
        if (res.statusCode === 200) {
          resolve(data);
        } else {
          resolve(null);
        }
      });
    });
    
    req.on('error', (err) => {
      console.log(`Proxy error: ${err.message}`);
      resolve(null);
    });
    
    req.setTimeout(8000, () => {
      req.destroy();
      resolve(null);
    });
  });
}

async function run() {
  for (const proxy of proxies) {
    const html = await tryProxy(proxy);
    if (html && html.length > 1000) {
      console.log(`SUCCESS matching proxy: ${proxy.substring(0, 45)}...`);
      fs.writeFileSync('proxy_output.txt', html);
      
      // Attempt to extract hashes
      const hashes = new Set();
      // Search window.postData
      let match;
      const regexHash = /"hash"\s*:\s*"([a-zA-Z0-9]{5,10})"/g;
      while ((match = regexHash.exec(html)) !== null) {
        const h = match[1];
        if (h !== '9TP6hPU' && h.length >= 5) hashes.add(h);
      }
      
      // Search for imgur paths
      const regexImg = /i\.imgur\.com\/([a-zA-Z0-9]{5,10})/gi;
      while ((match = regexImg.exec(html)) !== null) {
        const h = match[1];
        if (h !== '9TP6hPU' && h.length >= 5) hashes.add(h);
      }

      console.log(`Extracted ${hashes.size} hashes:`, Array.from(hashes));
      if (hashes.size > 0) {
        fs.writeFileSync('extracted_hashes.json', JSON.stringify(Array.from(hashes)));
        break;
      }
    }
  }
}

run();
