import https from 'https';
import fs from 'fs';

const albumId = '9TP6hPU';
const url = `https://imgur.com/a/${albumId}`;

https.get(url, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
  }
}, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Status code:', res.statusCode);
    console.log('HTML Length:', data.length);
    
    // Write full HTML for robust search
    fs.writeFileSync('imgur_page.html', data);
    console.log('Wrote HTML to imgur_page.html');
  });
}).on('error', (err) => {
  console.error('Error fetching Imgur:', err);
});
