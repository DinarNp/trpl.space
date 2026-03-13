import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { lecturerService } from '../services/lecturerService';

// Validation schemas
const educationSchema = z.object({
  id: z.number().optional(),
  degree: z.string().min(1, 'Degree is required'),
  institution: z.string().min(1, 'Institution is required'),
  major: z.string().min(1, 'Major is required'),
  thesisTitle: z.string().optional().nullable(),
  startYear: z.number().min(1900).max(2100),
  endYear: z.number().min(1900).max(2100),
});

const createLecturerSchema = z.object({
  nip: z.string().min(1, 'NIP is required').max(50),
  name: z.string().min(1, 'Name is required').max(255),
  shortName: z.string().min(1, 'Short name is required').max(20),
  email: z.string().email('Invalid email format').max(255),
  photo: z.string().max(500).optional().nullable(),
  functionalPosition: z.string().max(100).optional().nullable(),
  structuralPosition: z.string().max(100).optional().nullable(),
  googleScholar: z.string().max(500).optional().nullable(),
  scopus: z.string().max(500).optional().nullable(),
  sinta: z.string().max(500).optional().nullable(),
  academicStaffUGM: z.string().max(500).optional().nullable(),
  pddikti: z.string().max(500).optional().nullable(),
  researchInterest: z.string().optional().nullable(),
  educations: z.array(educationSchema).optional(),
  labIds: z.array(z.number()).optional(),
});

const updateLecturerSchema = z.object({
  nip: z.string().min(1).max(50).optional(),
  name: z.string().min(1).max(255).optional(),
  shortName: z.string().min(1).max(20).optional(),
  email: z.string().email().max(255).optional(),
  photo: z.string().max(500).optional().nullable(),
  functionalPosition: z.string().max(100).optional().nullable(),
  structuralPosition: z.string().max(100).optional().nullable(),
  googleScholar: z.string().max(500).optional().nullable(),
  scopus: z.string().max(500).optional().nullable(),
  sinta: z.string().max(500).optional().nullable(),
  academicStaffUGM: z.string().max(500).optional().nullable(),
  pddikti: z.string().max(500).optional().nullable(),
  researchInterest: z.string().optional().nullable(),
  educations: z.array(educationSchema).optional(),
  labIds: z.array(z.number()).optional(),
});

export const lecturerController = {
  // Get all lecturers
  async getAllLecturers(request: FastifyRequest, reply: FastifyReply) {
    try {
      const lecturers = await lecturerService.getAllLecturers();
      return reply.code(200).send({
        success: true,
        data: lecturers
      });
    } catch (error) {
      console.error('Error fetching lecturers:', error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to fetch lecturers'
      });
    }
  },

  // Get lecturer by ID
  async getLecturerById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const id = parseInt(request.params.id);
      const lecturer = await lecturerService.getLecturerById(id);

      if (!lecturer) {
        return reply.code(404).send({
          success: false,
          message: 'Lecturer not found'
        });
      }

      return reply.code(200).send({
        success: true,
        data: lecturer
      });
    } catch (error) {
      console.error('Error fetching lecturer:', error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to fetch lecturer'
      });
    }
  },

  // Get lecturer by shortName
  async getLecturerByShortName(request: FastifyRequest<{ Params: { shortName: string } }>, reply: FastifyReply) {
    try {
      const { shortName } = request.params;
      const lecturer = await lecturerService.getLecturerByShortName(shortName);

      if (!lecturer) {
        return reply.code(404).send({
          success: false,
          message: 'Lecturer not found'
        });
      }

      return reply.code(200).send({
        success: true,
        data: lecturer
      });
    } catch (error) {
      console.error('Error fetching lecturer:', error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to fetch lecturer'
      });
    }
  },

  // Create lecturer
  async createLecturer(request: FastifyRequest, reply: FastifyReply) {
    try {
      const validatedData = createLecturerSchema.parse(request.body);
      const lecturer = await lecturerService.createLecturer(validatedData as any);

      return reply.code(201).send({
        success: true,
        data: lecturer,
        message: 'Lecturer created successfully'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          message: 'Validation error',
          errors: error.errors
        });
      }

      console.error('Error creating lecturer:', error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to create lecturer'
      });
    }
  },

  // Update lecturer
  async updateLecturer(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const id = parseInt(request.params.id);
      const validatedData = updateLecturerSchema.parse(request.body);

      const lecturer = await lecturerService.updateLecturer(id, validatedData as any);

      return reply.code(200).send({
        success: true,
        data: lecturer,
        message: 'Lecturer updated successfully'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          message: 'Validation error',
          errors: error.errors
        });
      }

      console.error('Error updating lecturer:', error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to update lecturer'
      });
    }
  },

  // Delete lecturer
  async deleteLecturer(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const id = parseInt(request.params.id);
      await lecturerService.deleteLecturer(id);

      return reply.code(200).send({
        success: true,
        message: 'Lecturer deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting lecturer:', error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to delete lecturer'
      });
    }
  },
};
