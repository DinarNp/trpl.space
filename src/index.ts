import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyCors from '@fastify/cors';
import { projectRoutes } from './routes/projectRoutes';
import { authRoutes } from './routes/authRoutes';
import { labRoutes } from './routes/labRoutes';
import { lecturerRoutes } from './routes/lecturerRoutes';
import path from 'path';

const fastify = Fastify({
  logger: true
});

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

async function start() {
  try {
    // Register CORS
    await fastify.register(fastifyCors, {
      origin: true
    });

    // Register static files
    await fastify.register(fastifyStatic, {
      root: path.join(__dirname, '../public'),
      prefix: '/'
    });

    // Register API routes
    await fastify.register(projectRoutes, { prefix: '/api' });
    await fastify.register(authRoutes, { prefix: '/api/auth' });
    await fastify.register(labRoutes, { prefix: '/api' });
    await fastify.register(lecturerRoutes, { prefix: '/api' });

    // Image proxy — only for Google Drive URLs, with in-memory cache
    const imageCache = new Map<string, { buffer: Buffer; contentType: string; ts: number }>();
    const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 jam

    fastify.get('/api/image-proxy', async (request: any, reply: any) => {
      const { url } = request.query as { url?: string };
      if (!url) return reply.code(400).send('Missing url');

      // Hanya terima Google Drive URLs
      if (!url.includes('drive.google.com')) {
        return reply.code(400).send('Only Google Drive URLs are supported');
      }

      // Konversi Drive view/share URL ke direct image URL
      const driveFileMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (!driveFileMatch) return reply.code(400).send('Invalid Drive URL');
      const fileId = driveFileMatch[1];
      const resolvedUrl = `https://drive.usercontent.google.com/download?id=${fileId}&export=view&authuser=0`;

      // Cek cache
      const cached = imageCache.get(fileId);
      if (cached && Date.now() - cached.ts < CACHE_TTL) {
        reply.header('Content-Type', cached.contentType);
        reply.header('Cache-Control', 'public, max-age=86400');
        reply.header('X-Cache', 'HIT');
        return reply.send(cached.buffer);
      }

      try {
        const response = await fetch(resolvedUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TRPL.SPACE/1.0)' },
          redirect: 'follow'
        });
        if (!response.ok) return reply.code(response.status).send('Upstream error');
        const contentType = response.headers.get('content-type') || 'image/jpeg';
        if (!contentType.startsWith('image/')) return reply.code(502).send('Not an image');
        const buffer = Buffer.from(await response.arrayBuffer());

        // Simpan ke cache
        imageCache.set(fileId, { buffer, contentType, ts: Date.now() });

        reply.header('Content-Type', contentType);
        reply.header('Cache-Control', 'public, max-age=86400');
        reply.header('X-Cache', 'MISS');
        return reply.send(buffer);
      } catch {
        return reply.code(502).send('Failed to fetch image');
      }
    });

    // Start server
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
