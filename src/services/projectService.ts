import prisma from './prisma';
import { Project } from '@prisma/client';

export interface CreateProjectDTO {
  title: string;
  description: string;
  subdomain: string;
  url: string;
  category: string;
  tags: string[];
  status?: string;
  color?: string;
  icon?: string;
  created?: string;
  featured?: boolean;
  lecturerIds?: number[];
}

export interface UpdateProjectDTO extends Partial<CreateProjectDTO> {}

export const projectService = {
  async getAllProjects(): Promise<any[]> {
    return await prisma.project.findMany({
      include: {
        lecturers: {
          include: {
            lecturer: {
              select: {
                id: true,
                name: true,
                shortName: true,
                photo: true,
              }
            }
          }
        }
      },
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' }
      ]
    });
  },

  async getProjectById(id: number): Promise<any | null> {
    return await prisma.project.findUnique({
      where: { id },
      include: {
        lecturers: {
          include: {
            lecturer: {
              select: {
                id: true,
                name: true,
                shortName: true,
                photo: true,
                functionalPosition: true,
                email: true,
              }
            }
          }
        }
      }
    });
  },

  async getProjectBySubdomain(subdomain: string): Promise<Project | null> {
    return await prisma.project.findUnique({
      where: { subdomain }
    });
  },

  async createProject(data: CreateProjectDTO): Promise<any> {
    const { lecturerIds, ...projectData } = data;
    
    const createData: any = {
      ...projectData,
      tags: JSON.stringify(projectData.tags)
    };
    
    // Convert empty string to null for optional fields
    if (createData.color === '') {
      createData.color = null;
    }
    if (createData.icon === '') {
      createData.icon = null;
    }
    if (createData.created === '') {
      createData.created = null;
    }
    
    // Add lecturers if provided
    if (lecturerIds && lecturerIds.length > 0) {
      createData.lecturers = {
        create: lecturerIds.map(lecturerId => ({
          lecturerId: lecturerId
        }))
      };
    }
    
    return await prisma.project.create({
      data: createData,
      include: {
        lecturers: {
          include: {
            lecturer: {
              select: {
                id: true,
                name: true,
                shortName: true,
              }
            }
          }
        }
      }
    });
  },

  async updateProject(id: number, data: UpdateProjectDTO): Promise<any> {
    const { lecturerIds, ...projectData } = data;
    
    const updateData: any = { ...projectData };
    if (projectData.tags) {
      updateData.tags = JSON.stringify(projectData.tags);
    }
    
    // Convert empty string to null for optional fields
    if (updateData.color === '') {
      updateData.color = null;
    }
    if (updateData.icon === '') {
      updateData.icon = null;
    }
    if (updateData.created === '') {
      updateData.created = null;
    }
    
    // Handle lecturers update
    if (lecturerIds !== undefined) {
      // Delete all existing lecturer relationships
      await prisma.projectLecturer.deleteMany({
        where: { projectId: id }
      });

      // Create new lecturer relationships
      if (lecturerIds.length > 0) {
        updateData.lecturers = {
          create: lecturerIds.map(lecturerId => ({
            lecturerId: lecturerId
          }))
        };
      }
    }
    
    return await prisma.project.update({
      where: { id },
      data: updateData,
      include: {
        lecturers: {
          include: {
            lecturer: {
              select: {
                id: true,
                name: true,
                shortName: true,
              }
            }
          }
        }
      }
    });
  },

  async deleteProject(id: number): Promise<Project> {
    return await prisma.project.delete({
      where: { id }
    });
  },

  async getFeaturedProjects(): Promise<Project[]> {
    return await prisma.project.findMany({
      where: { featured: true },
      orderBy: { createdAt: 'desc' }
    });
  },

  async getProjectsByCategory(category: string): Promise<Project[]> {
    return await prisma.project.findMany({
      where: { category },
      orderBy: { createdAt: 'desc' }
    });
  }
};
