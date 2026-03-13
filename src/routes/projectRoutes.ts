import { FastifyInstance } from 'fastify';
import { projectController } from '../controllers/projectController';

export async function projectRoutes(fastify: FastifyInstance) {
  fastify.get('/projects', projectController.getAllProjects);
  fastify.get('/projects/:id', projectController.getProjectById);
  fastify.post('/projects', projectController.createProject);
  fastify.put('/projects/:id', projectController.updateProject);
  fastify.delete('/projects/:id', projectController.deleteProject);
}
