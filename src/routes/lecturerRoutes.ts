import { FastifyInstance } from 'fastify';
import { lecturerController } from '../controllers/lecturerController';

export async function lecturerRoutes(fastify: FastifyInstance) {
  // Get all lecturers
  fastify.get('/lecturers', lecturerController.getAllLecturers);

  // Get lecturer by ID
  fastify.get('/lecturers/:id', lecturerController.getLecturerById);

  // Get lecturer by shortName
  fastify.get('/lecturers/short/:shortName', lecturerController.getLecturerByShortName);

  // Create lecturer
  fastify.post('/lecturers', lecturerController.createLecturer);

  // Update lecturer
  fastify.put('/lecturers/:id', lecturerController.updateLecturer);

  // Delete lecturer
  fastify.delete('/lecturers/:id', lecturerController.deleteLecturer);
}
