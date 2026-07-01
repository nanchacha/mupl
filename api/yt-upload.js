import { google } from 'googleapis';
import youtubedl from 'youtube-dl-exec';
import ffmpegStatic from 'ffmpeg-static';
import { PassThrough } from 'stream';
import dotenv from 'dotenv';

dotenv.config();

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

      // Fetch video title using youtube-dl-exec (JSON dump)
      const info = await youtubedl(url, { dumpJson: true, noWarnings: true });
      const title = (info.title || 'Unknown Title').replace(/[\\/:*?"<>|]/g, '');

      // Set up Google Drive API
      const auth = new google.auth.JWT(
        process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        null,
        (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
        ['https://www.googleapis.com/auth/drive.file']
      );

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
        resource: fileMetadata,
        media: media,
        fields: 'id'
      });

      // Stream YouTube video to stdout using youtube-dl-exec (yt-dlp)
      const ytProcess = youtubedl.exec(url, {
        extractAudio: true,
        audioFormat: 'mp3',
        audioQuality: 0,
        ffmpegLocation: ffmpegStatic,
        output: '-',
      }, { stdio: ['ignore', 'pipe', 'ignore'] });

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
