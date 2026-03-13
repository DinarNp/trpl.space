import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { labService } from '../services/labService';

// Validation schemas
const createLabSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().min(1, 'Description is required'),
});

const updateLabSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().min(1).optional(),
});

export const labController = {
  // Get all labs
  async getAllLabs(request: FastifyRequest, reply: FastifyReply) {
    try {
      const labs = await labService.getAllLabs();
      return reply.code(200).send({
        success: true,
        data: labs
      });
    } catch (error) {
      console.error('Error fetching labs:', error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to fetch labs'
      });
    }
  },

  // Get lab by ID
  async getLabById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const id = parseInt(request.params.id);
      const lab = await labService.getLabById(id);

      if (!lab) {
        return reply.code(404).send({
          success: false,
          message: 'Lab not found'
        });
      }

      return reply.code(200).send({
        success: true,
        data: lab
      });
    } catch (error) {
      console.error('Error fetching lab:', error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to fetch lab'
      });
    }
  },

  // Create lab
  async createLab(request: FastifyRequest, reply: FastifyReply) {
    try {
      const validatedData = createLabSchema.parse(request.body);
      const lab = await labService.createLab(validatedData);

      return reply.code(201).send({
        success: true,
        data: lab,
        message: 'Lab created successfully'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          message: 'Validation error',
          errors: error.errors
        });
      }

      console.error('Error creating lab:', error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to create lab'
      });
    }
  },

  // Update lab
  async updateLab(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const id = parseInt(request.params.id);
      const validatedData = updateLabSchema.parse(request.body);

      const lab = await labService.updateLab(id, validatedData);

      return reply.code(200).send({
        success: true,
        data: lab,
        message: 'Lab updated successfully'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          message: 'Validation error',
          errors: error.errors
        });
      }

      console.error('Error updating lab:', error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to update lab'
      });
    }
  },

  // Delete lab
  async deleteLab(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const id = parseInt(request.params.id);
      await labService.deleteLab(id);

      return reply.code(200).send({
        success: true,
        message: 'Lab deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting lab:', error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to delete lab'
      });
    }
  },
};
