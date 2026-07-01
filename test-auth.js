import { google } from 'googleapis';

async function run() {
  const auth = new google.auth.JWT(
    undefined,
    null,
    '',
    ['https://www.googleapis.com/auth/drive.file']
  );

  try {
    await auth.authorize();
    console.log("Authorize succeeded?!");
    
    const drive = google.drive({ version: 'v3', auth });
    await drive.files.create({
       requestBody: { name: 'test' },
       media: { mimeType: 'text/plain', body: 'hello' }
    });
  } catch(e) {
    console.error("Caught error:", e.message);
  }
}
run();
