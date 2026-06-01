import { defineConfig } from 'vite';
import https from 'https';

export default defineConfig({
  plugins: [
    {
      name: 'drive-proxy',
      configureServer(server) {
        // Endpoint to parse folder contents
        server.middlewares.use('/api/folder', (req, res) => {
          const urlObj = new URL(req.url, 'http://localhost');
          const folderId = urlObj.searchParams.get('id');
          if (!folderId) {
            res.statusCode = 400;
            return res.end('Missing folder id');
          }

          const folderUrl = `https://drive.google.com/drive/folders/${folderId}`;
          https.get(folderUrl, (googleRes) => {
            let data = '';
            googleRes.on('data', chunk => data += chunk);
            googleRes.on('end', () => {
              // Parse the HTML to find file IDs and names
              const regex = /<div[^>]*data-id="([a-zA-Z0-9_-]+)"[^>]*>[\s\S]*?<strong class="DNoYtb">([^<]+(?:\.mp3|\.m4a|\.wav|\.flac|\.ogg))<\/strong>/g;
              const files = [];
              const seenIds = new Set();
              
              let match;
              while ((match = regex.exec(data)) !== null) {
                const id = match[1];
                let name = match[2].replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
                if (!seenIds.has(id)) {
                  seenIds.add(id);
                  files.push({ id, name });
                }
              }
              
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.end(JSON.stringify(files));
            });
          }).on('error', (err) => {
            res.statusCode = 500;
            res.end(err.message);
          });
        });

        // Endpoint to fetch single file info
        server.middlewares.use('/api/info', (req, res) => {
          const urlObj = new URL(req.url, 'http://localhost');
          const fileId = urlObj.searchParams.get('id');
          if (!fileId) {
            res.statusCode = 400;
            return res.end('Missing file id');
          }

          https.get(`https://drive.google.com/file/d/${fileId}/view`, (googleRes) => {
            let data = '';
            googleRes.on('data', chunk => data += chunk);
            googleRes.on('end', () => {
              const match = data.match(/<title>(.+?) - Google Drive<\/title>/);
              const title = match ? match[1] : `Track ID: ${fileId.substring(0, 8)}...`;
              
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.end(JSON.stringify({ title }));
            });
          }).on('error', (err) => {
            res.statusCode = 500;
            res.end(err.message);
          });
        });

        // Endpoint to proxy audio stream
        server.middlewares.use('/api/stream', (req, res) => {
          const urlObj = new URL(req.url, 'http://localhost');
          const fileId = urlObj.searchParams.get('id');
          if (!fileId) {
            res.statusCode = 400;
            return res.end('Missing id');
          }
          
          const url = `https://docs.google.com/uc?export=download&id=${fileId}`;
          
          // Function to safely pipe the response and modify headers
          const pipeResponse = (sourceRes) => {
            const headers = { ...sourceRes.headers };
            // Remove problematic headers
            delete headers['cross-origin-resource-policy'];
            delete headers['cross-origin-embedder-policy'];
            delete headers['x-frame-options'];
            delete headers['content-security-policy'];
            
            // Add open CORS and CORP headers
            headers['access-control-allow-origin'] = '*';
            headers['cross-origin-resource-policy'] = 'cross-origin';

            res.writeHead(sourceRes.statusCode, headers);
            sourceRes.pipe(res);
          };

          https.get(url, (googleRes) => {
            // Follow redirect if there is one
            if ([301, 302, 303, 307, 308].includes(googleRes.statusCode) && googleRes.headers.location) {
              https.get(googleRes.headers.location, (contentRes) => {
                pipeResponse(contentRes);
              }).on('error', (err) => {
                res.statusCode = 500;
                res.end(err.message);
              });
            } else {
              pipeResponse(googleRes);
            }
          }).on('error', (err) => {
            res.statusCode = 500;
            res.end(err.message);
          });
        });
      }
    }
  ]
});
