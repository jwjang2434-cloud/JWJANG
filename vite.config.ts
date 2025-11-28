import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import os from 'os';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      allowedHosts: ['procommercial-graphitic-valene.ngrok-free.dev'],
    },
    plugins: [
      react(),
      // Custom plugin for saving routes to file
      {
        name: 'commuter-bus-api',
        configureServer(server) {
          server.middlewares.use('/api/save-routes', async (req, res) => {
            if (req.method === 'POST') {
              let body = '';
              req.on('data', chunk => { body += chunk.toString(); });
              req.on('end', () => {
                try {
                  const { code } = JSON.parse(body);
                  const filePath = path.resolve(__dirname, 'constants.ts');

                  // 백업 파일 생성
                  const backupPath = path.resolve(__dirname, 'constants.backup.ts');
                  if (fs.existsSync(filePath)) {
                    fs.copyFileSync(filePath, backupPath);
                  }

                  // 파일 쓰기
                  fs.writeFileSync(filePath, code, 'utf-8');

                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ success: true, message: 'File saved successfully' }));
                } catch (error) {
                  console.error('Error saving file:', error);
                  res.writeHead(500, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ success: false, error: error.message }));
                }
              });
            } else {
              res.writeHead(405, { 'Content-Type': 'text/plain' });
              res.end('Method Not Allowed');
            }
          });

          // Endpoint to get host IP address (like ipconfig)
          server.middlewares.use('/api/host-ip', (req, res) => {
            const interfaces = os.networkInterfaces();
            let ipAddress = 'Unavailable';

            for (const name of Object.keys(interfaces)) {
              for (const iface of interfaces[name]!) {
                // Skip internal (127.0.0.1) and non-IPv4 addresses
                if (iface.family === 'IPv4' && !iface.internal) {
                  ipAddress = iface.address;
                  break;
                }
              }
              if (ipAddress !== 'Unavailable') break;
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ip: ipAddress }));
          });
        }
      }
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
