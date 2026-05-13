import https from 'https';

export default function handler(req, res) {
  const folderId = req.query.id;
  if (!folderId) {
    res.status(400).send('Missing folder id');
    return;
  }

  const folderUrl = `https://drive.google.com/drive/folders/${folderId}`;
  https.get(folderUrl, (googleRes) => {
    let data = '';
    googleRes.on('data', chunk => data += chunk);
    googleRes.on('end', () => {
      const regex = /\[null,&quot;([a-zA-Z0-9_-]+)&quot;\].+?&quot;((?:(?!&quot;).)+(?:\.mp3|\.m4a|\.wav|\.flac|\.ogg))&quot;/g;
      const files = [];
      const seenIds = new Set();
      
      let match;
      while ((match = regex.exec(data)) !== null) {
        const id = match[1];
        const name = match[2].replace(/&amp;/g, '&');
        if (!seenIds.has(id)) {
          seenIds.add(id);
          files.push({ id, name });
        }
      }
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.status(200).send(JSON.stringify(files));
    });
  }).on('error', (err) => {
    res.status(500).send(err.message);
  });
}
