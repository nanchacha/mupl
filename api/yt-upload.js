import { google } from 'googleapis';
import { create } from 'youtube-dl-exec';
import ffmpegStatic from 'ffmpeg-static';
import { PassThrough } from 'stream';
import dotenv from 'dotenv';
import path from 'path';
import os from 'os';

dotenv.config();

// Initialize youtube-dl-exec with the standalone binary downloaded via postinstall
const binName = os.platform() === 'win32' ? 'yt-dlp.exe' : 'yt-dlp_linux';
const ytDlpPath = path.join(process.cwd(), 'bin', binName);
const youtubedl = create(ytDlpPath);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', async () => {
    try {
      const parsed = JSON.parse(body);
      const url = parsed.url;
      
      if (!url || (!url.includes('youtube.com') && !url.includes('youtu.be'))) {
        res.status(400).send('Invalid YouTube URL');
        return;
      }

      // Prepare yt-dlp options and cookies
      let ytDlpOptions = { dumpJson: true, noWarnings: true };
      
      if (process.env.YOUTUBE_COOKIES) {
        try {
          const cookies = JSON.parse(process.env.YOUTUBE_COOKIES);
          let netscapeCookies = "# Netscape HTTP Cookie File\n";
          cookies.forEach(c => {
            const domain = c.domain || '.youtube.com';
            const includeSubdomains = domain.startsWith('.') ? 'TRUE' : 'FALSE';
            const cookiePath = c.path || '/';
            const secure = (c.secure || c.name.startsWith('__Secure')) ? 'TRUE' : 'FALSE';
            const expiry = c.expirationDate ? Math.floor(c.expirationDate) : 2147483647;
            netscapeCookies += `${domain}\t${includeSubdomains}\t${cookiePath}\t${secure}\t${expiry}\t${c.name}\t${c.value}\n`;
          });
          const tempCookieFile = path.join(os.tmpdir(), 'yt-cookies.txt');
          import('fs').then(fs => fs.writeFileSync(tempCookieFile, netscapeCookies));
          ytDlpOptions.cookies = tempCookieFile;
        } catch (e) {
          console.error("Failed to parse YOUTUBE_COOKIES as JSON.", e);
        }
      }

      // Fetch video title (JSON dump)
      const info = await youtubedl(url, ytDlpOptions);
      const title = (info.title || 'Unknown Title').replace(/[\\/:*?"<>|]/g, '');

      // Set up Google Drive API
      let privateKey = process.env.GOOGLE_PRIVATE_KEY || '';
      // Remove ANY quotes if user accidentally pasted them in Vercel
      privateKey = privateKey.replace(/"/g, '').replace(/'/g, '');
      privateKey = privateKey.replace(/\\n/g, '\n');

      const auth = new google.auth.JWT(
        process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        null,
        privateKey,
        ['https://www.googleapis.com/auth/drive.file']
      );

      try {
        // Explicitly authorize to ensure credentials are valid before making requests
        await auth.authorize();
      } catch (authErr) {
        throw new Error(`Google API Authentication Failed. Please check your Vercel Environment Variables. The private key or email is incorrectly formatted. Details: ${authErr.message}`);
      }

      const drive = google.drive({ version: 'v3', auth });
      const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
      
      if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
         throw new Error("Google API credentials are not set in .env");
      }

      const passThrough = new PassThrough();

      const fileMetadata = {
        name: `${title}.mp3`,
        parents: [folderId]
      };
      
      const media = {
        mimeType: 'audio/mp3',
        body: passThrough
      };

      // Start Google Drive Upload asynchronously
      const uploadPromise = drive.files.create({
        auth: auth, // Explicitly passing auth to prevent missing credential errors
        resource: fileMetadata,
        media: media,
        fields: 'id'
      });

      // Stream YouTube video to stdout using the standalone yt-dlp
      const execOptions = {
        extractAudio: true,
        audioFormat: 'mp3',
        audioQuality: 0,
        ffmpegLocation: ffmpegStatic,
        output: '-',
      };
      if (ytDlpOptions.cookies) {
        execOptions.cookies = ytDlpOptions.cookies;
      }

      const ytProcess = youtubedl.exec(url, execOptions, { stdio: ['ignore', 'pipe', 'ignore'] });

      ytProcess.stdout.pipe(passThrough);

      ytProcess.on('error', (err) => {
        console.error('yt-dlp process error:', err);
      });

      // Wait for the upload to complete
      const uploadedFile = await uploadPromise;
      
      res.setHeader('Content-Type', 'application/json');
      res.status(200).send(JSON.stringify({ success: true, id: uploadedFile.data.id, title: `${title}.mp3` }));

    } catch (error) {
      console.error(error);
      res.status(500).send(error.message || 'An error occurred during extraction or upload');
    }
  });
}
