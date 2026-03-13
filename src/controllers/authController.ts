import { FastifyRequest, FastifyReply } from 'fastify';
import { authService, LoginDTO } from '../services/authService';
import { z } from 'zod';

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});

export const authController = {
  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const validatedData = loginSchema.parse(request.body);
      const result = await authService.login(validatedData as LoginDTO);
      
      if (result.success) {
        return reply.send({ 
          success: true, 
          user: result.user 
        });
      } else {
        return reply.status(401).send({ 
          success: false, 
          message: result.message 
        });
      }
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return reply.status(400).send({ success: false, error: error.errors });
      }
      return reply.status(500).send({ success: false, error: error.message });
    }
  }
};
