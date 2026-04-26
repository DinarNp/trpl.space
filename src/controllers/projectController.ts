import { FastifyRequest, FastifyReply } from 'fastify';
import { projectService, CreateProjectDTO, UpdateProjectDTO } from '../services/projectService';
import { z } from 'zod';

const fieldLabels: Record<string, string> = {
  title: 'Judul',
  description: 'Deskripsi',
  subdomain: 'Subdomain',
  url: 'URL',
  category: 'Kategori',
  tags: 'Tags',
  status: 'Status',
  icon: 'Icon',
  color: 'Warna',
  created: 'Tanggal',
  pptLink: 'Link PPT',
  videoLink: 'Link Video',
};

function formatZodError(errors: any[]): string {
  return errors.map(e => {
    const field = fieldLabels[e.path?.[0]] || e.path?.join('.') || 'Field';
    if (e.message === 'Required') return `${field} wajib diisi`;
    if (e.message.includes('Invalid url')) return `${field} harus berupa URL yang valid (contoh: https://...)`;
    if (e.message.includes('too_small')) return `${field} tidak boleh kosong`;
    return `${field}: ${e.message}`;
  }).join(' | ');
}

const createProjectSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  subdomain: z.string().min(1).max(100),
  url: z.string().url(),
  category: z.string().min(1).max(100),
  tags: z.array(z.string()),
  status: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  created: z.string().optional(),
  featured: z.boolean().optional(),
  pptLink: z.string().optional(),
  videoLink: z.string().optional(),
  lecturerIds: z.array(z.number()).optional()
});

const updateProjectSchema = createProjectSchema.partial();

export const projectController = {
  async getAllProjects(request: FastifyRequest, reply: FastifyReply) {
    try {
      const projects = await projectService.getAllProjects();
      const parsedProjects = projects.map(project => ({
        ...project,
        tags: JSON.parse(project.tags)
      }));
      return reply.send({ success: true, data: parsedProjects });
    } catch (error: any) {
      return reply.status(500).send({ success: false, error: error.message });
    }
  },

  async getProjectById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const id = parseInt(request.params.id);
      const project = await projectService.getProjectById(id);
      
      if (!project) {
        return reply.status(404).send({ success: false, error: 'Project not found' });
      }

      const parsedProject = {
        ...project,
        tags: JSON.parse(project.tags)
      };

      return reply.send({ success: true, data: parsedProject });
    } catch (error: any) {
      return reply.status(500).send({ success: false, error: error.message });
    }
  },

  async createProject(request: FastifyRequest, reply: FastifyReply) {
    try {
      const validatedData = createProjectSchema.parse(request.body);
      const project = await projectService.createProject(validatedData as CreateProjectDTO);
      const parsedProject = { ...project, tags: JSON.parse(project.tags) };
      return reply.status(201).send({ success: true, data: parsedProject });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const msg = formatZodError(error.errors);
        return reply.status(400).send({ success: false, error: msg });
      }
      if (error.code === 'P2002' && error.meta?.target?.includes('subdomain')) {
        return reply.status(400).send({ success: false, error: 'Subdomain sudah digunakan, pilih subdomain lain.' });
      }
      return reply.status(500).send({ success: false, error: 'Terjadi kesalahan server, coba lagi.' });
    }
  },

  async updateProject(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const id = parseInt(request.params.id);
      const validatedData = updateProjectSchema.parse(request.body);
      const project = await projectService.updateProject(id, validatedData as UpdateProjectDTO);
      const parsedProject = { ...project, tags: JSON.parse(project.tags) };
      return reply.send({ success: true, data: parsedProject });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const msg = formatZodError(error.errors);
        return reply.status(400).send({ success: false, error: msg });
      }
      if (error.code === 'P2002' && error.meta?.target?.includes('subdomain')) {
        return reply.status(400).send({ success: false, error: 'Subdomain sudah digunakan, pilih subdomain lain.' });
      }
      return reply.status(500).send({ success: false, error: 'Terjadi kesalahan server, coba lagi.' });
    }
  },

  async deleteProject(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const id = parseInt(request.params.id);
      await projectService.deleteProject(id);
      return reply.send({ success: true, message: 'Project deleted successfully' });
    } catch (error: any) {
      return reply.status(500).send({ success: false, error: error.message });
    }
  }
};
