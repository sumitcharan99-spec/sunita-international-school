import express from 'express';
import path from 'path';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Enable comprehensive CORS support for all static files, manifests, and assets
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range');
    
    // Handle OPTIONS preflight
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });

  // Explicitly serve manifest.json with correct MIME type and CORS headers
  app.get('/manifest.json', (req, res) => {
    res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    
    const distPath = path.join(process.cwd(), 'dist', 'manifest.json');
    const publicPath = path.join(process.cwd(), 'public', 'manifest.json');
    
    res.sendFile(distPath, (err) => {
      if (err) {
        res.sendFile(publicPath, (err2) => {
          if (err2) {
            res.status(404).send('manifest.json not found');
          }
        });
      }
    });
  });

  // Explicitly serve service worker with correct CORS and disable caching
  app.get('/sw.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Service-Worker-Allowed', '/');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    
    const distPath = path.join(process.cwd(), 'dist', 'sw.js');
    const publicPath = path.join(process.cwd(), 'public', 'sw.js');
    
    res.sendFile(distPath, (err) => {
      if (err) {
        res.sendFile(publicPath, (err2) => {
          if (err2) {
            res.status(404).send('sw.js not found');
          }
        });
      }
    });
  });

  // Explicitly serve icon.svg with correct CORS and MIME type
  app.get('/icon.svg', (req, res) => {
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    
    const distPath = path.join(process.cwd(), 'dist', 'icon.svg');
    const publicPath = path.join(process.cwd(), 'public', 'icon.svg');
    
    res.sendFile(distPath, (err) => {
      if (err) {
        res.sendFile(publicPath, (err2) => {
          if (err2) {
            res.status(404).send('icon.svg not found');
          }
        });
      }
    });
  });

  // Serve static assets in production, or use Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        host: '0.0.0.0',
        port: 3000,
        cors: true
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    // Serve static files with proper cache headers
    app.use(express.static(distPath, {
      setHeaders: (res, path) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        if (path.endsWith('.json') || path.endsWith('.webmanifest')) {
          res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
        }
      }
    }));
    
    // SPA Fallback
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://0.0.0.0:${PORT} under NODE_ENV=${process.env.NODE_ENV || 'development'}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
