import https from 'https';

export default function handler(req, res) {
  const fileId = req.query.id;
  if (!fileId) {
    res.status(400).send('Missing file id');
    return;
  }

  https.get(`https://drive.google.com/file/d/${fileId}/view`, (googleRes) => {
    let data = '';
    googleRes.on('data', chunk => data += chunk);
    googleRes.on('end', () => {
      const match = data.match(/<title>(.+?) - Google Drive<\/title>/);
      const title = match ? match[1] : `Track ID: ${fileId.substring(0, 8)}...`;
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.status(200).send(JSON.stringify({ title }));
    });
  }).on('error', (err) => {
    res.status(500).send(err.message);
  });
}
