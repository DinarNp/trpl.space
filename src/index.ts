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

    // Start server
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
