import fs from 'fs';
import path from 'path';
import https from 'https';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const binDir = path.join(__dirname, '..', 'bin');

if (!fs.existsSync(binDir)) {
  fs.mkdirSync(binDir, { recursive: true });
}

let downloadUrl = '';
let fileName = '';

if (os.platform() === 'win32') {
  downloadUrl = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe';
  fileName = 'yt-dlp.exe';
} else {
  // Assume Linux (Vercel)
  downloadUrl = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux';
  fileName = 'yt-dlp_linux';
}

const filePath = path.join(binDir, fileName);

console.log(`Downloading ${fileName} from ${downloadUrl}...`);

const file = fs.createWriteStream(filePath);

https.get(downloadUrl, (response) => {
  // Follow redirects if necessary (GitHub releases use redirects)
  if (response.statusCode === 301 || response.statusCode === 302) {
    https.get(response.headers.location, (res) => {
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        // Make executable on Linux
        if (os.platform() !== 'win32') {
          fs.chmodSync(filePath, '755');
        }
        console.log(`Successfully downloaded ${fileName} to ${filePath}`);
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {});
      console.error(`Error downloading ${fileName}:`, err.message);
    });
  } else {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      if (os.platform() !== 'win32') {
        fs.chmodSync(filePath, '755');
      }
      console.log(`Successfully downloaded ${fileName} to ${filePath}`);
    });
  }
}).on('error', (err) => {
  fs.unlink(filePath, () => {});
  console.error(`Error downloading ${fileName}:`, err.message);
});
