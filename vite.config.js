import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function apiPlugin() {
  return {
    name: 'api-handler',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/coach' && req.method === 'POST') {
          try {
            // Parse the request body
            const body = await new Promise((resolve, reject) => {
              let data = '';
              req.on('data', chunk => { data += chunk; });
              req.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch (e) { reject(e); }
              });
              req.on('error', reject);
            });

            // Dynamically import the handler module
            const mod = await server.ssrLoadModule('/api/coach.js');
            
            // Create a mock req/res for the serverless handler
            const mockReq = { method: 'POST', body };
            const mockRes = {
              _statusCode: 200,
              _headers: {},
              headersSent: false,
              status(code) { this._statusCode = code; return this; },
              setHeader(key, value) { this._headers[key] = value; },
              json(data) {
                this.headersSent = true;
                res.writeHead(this._statusCode, { 'Content-Type': 'application/json', ...this._headers });
                res.end(JSON.stringify(data));
              },
              write(chunk) {
                if (!this.headersSent) {
                  res.writeHead(this._statusCode, this._headers);
                  this.headersSent = true;
                }
                res.write(chunk);
              },
              end() {
                if (!this.headersSent) {
                  res.writeHead(this._statusCode, this._headers);
                  this.headersSent = true;
                }
                res.end();
              },
            };

            await mod.default(mockReq, mockRes);
          } catch (err) {
            console.error('[api-plugin] Error:', err);
            if (!res.headersSent) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message }));
            }
          }
        } else {
          next();
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [apiPlugin(), react()],
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
})
