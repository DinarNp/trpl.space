import { FastifyInstance } from 'fastify';
import { labController } from '../controllers/labController';

export async function labRoutes(fastify: FastifyInstance) {
  // Get all labs
  fastify.get('/labs', labController.getAllLabs);

  // Get lab by ID
  fastify.get('/labs/:id', labController.getLabById);

  // Create lab
  fastify.post('/labs', labController.createLab);

  // Update lab
  fastify.put('/labs/:id', labController.updateLab);

  // Delete lab
  fastify.delete('/labs/:id', labController.deleteLab);
}
