import https from 'https';

export default function handler(req, res) {
  const fileId = req.query.id;
  if (!fileId) {
    res.status(400).send('Missing id');
    return;
  }
  
  const url = `https://docs.google.com/uc?export=download&id=${fileId}`;
  
  const pipeResponse = (sourceRes) => {
    const headers = { ...sourceRes.headers };
    delete headers['cross-origin-resource-policy'];
    delete headers['cross-origin-embedder-policy'];
    delete headers['x-frame-options'];
    delete headers['content-security-policy'];
    
    headers['access-control-allow-origin'] = '*';
    headers['cross-origin-resource-policy'] = 'cross-origin';

    res.writeHead(sourceRes.statusCode, headers);
    sourceRes.pipe(res);
  };

  https.get(url, (googleRes) => {
    if ([301, 302, 303, 307, 308].includes(googleRes.statusCode) && googleRes.headers.location) {
      https.get(googleRes.headers.location, (contentRes) => {
        pipeResponse(contentRes);
      }).on('error', (err) => {
        res.status(500).send(err.message);
      });
    } else {
      pipeResponse(googleRes);
    }
  }).on('error', (err) => {
    res.status(500).send(err.message);
  });
}
