import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

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
