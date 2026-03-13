import prisma from './prisma';

export interface CreateLabDTO {
  name: string;
  description: string;
}

export interface UpdateLabDTO {
  name?: string;
  description?: string;
}

export const labService = {
  // Get all labs
  async getAllLabs() {
    return await prisma.lab.findMany({
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
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
  },

  // Get lab by ID
  async getLabById(id: number) {
    return await prisma.lab.findUnique({
      where: { id },
      include: {
        lecturers: {
          include: {
            lecturer: {
              select: {
                id: true,
                nip: true,
                name: true,
                shortName: true,
                email: true,
                photo: true,
                functionalPosition: true,
                structuralPosition: true,
                researchInterest: true,
              }
            }
          }
        }
      }
    });
  },

  // Create lab
  async createLab(data: CreateLabDTO) {
    return await prisma.lab.create({
      data: {
        name: data.name,
        description: data.description,
      }
    });
  },

  // Update lab
  async updateLab(id: number, data: UpdateLabDTO) {
    return await prisma.lab.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description && { description: data.description }),
      }
    });
  },

  // Delete lab
  async deleteLab(id: number) {
    return await prisma.lab.delete({
      where: { id }
    });
  },
};
