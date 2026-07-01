import { google } from 'googleapis';
import ytdl from '@distube/ytdl-core';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import { PassThrough } from 'stream';
import dotenv from 'dotenv';

dotenv.config();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  // Set ffmpeg path
  ffmpeg.setFfmpegPath(ffmpegStatic);

  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', async () => {
    try {
      const parsed = JSON.parse(body);
      const url = parsed.url;
      
      if (!url || !ytdl.validateURL(url)) {
        res.status(400).send('Invalid YouTube URL');
        return;
      }

      // Configure Agent with Cookies to bypass "Sign in to confirm you're not a bot"
      let agent;
      if (process.env.YOUTUBE_COOKIES) {
        try {
          const cookies = JSON.parse(process.env.YOUTUBE_COOKIES);
          agent = ytdl.createAgent(cookies);
        } catch (e) {
          console.error("Failed to parse YOUTUBE_COOKIES. Ensure it's a valid JSON array of cookies.");
        }
      }

      const info = await ytdl.getInfo(url, agent ? { agent } : undefined);
      const title = info.videoDetails.title.replace(/[\\/:*?"<>|]/g, ''); // Clean filename

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

      // Stream YouTube video -> ffmpeg -> PassThrough
      const ytStream = ytdl(url, { quality: 'highestaudio', agent: agent });
      
      ffmpeg(ytStream)
        .audioBitrate(128)
        .format('mp3')
        .on('error', (err) => {
          console.error('ffmpeg error:', err);
          res.status(500).send('Error converting audio: ' + err.message);
        })
        .pipe(passThrough);

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
