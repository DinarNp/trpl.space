import prisma from './prisma';

export interface EducationDTO {
  id?: number;
  degree: string;
  institution: string;
  major: string;
  thesisTitle?: string;
  startYear: number;
  endYear: number;
}

export interface CreateLecturerDTO {
  nip: string;
  name: string;
  shortName: string;
  email: string;
  photo?: string;
  functionalPosition?: string;
  structuralPosition?: string;
  googleScholar?: string;
  scopus?: string;
  sinta?: string;
  academicStaffUGM?: string;
  pddikti?: string;
  researchInterest?: string;
  educations?: EducationDTO[];
  labIds?: number[];
}

export interface UpdateLecturerDTO {
  nip?: string;
  name?: string;
  shortName?: string;
  email?: string;
  photo?: string;
  functionalPosition?: string;
  structuralPosition?: string;
  googleScholar?: string;
  scopus?: string;
  sinta?: string;
  academicStaffUGM?: string;
  pddikti?: string;
  researchInterest?: string;
  educations?: EducationDTO[];
  labIds?: number[];
}

export const lecturerService = {
  // Get all lecturers
  async getAllLecturers() {
    return await prisma.lecturer.findMany({
      include: {
        educations: {
          orderBy: { endYear: 'desc' }
        },
        labs: {
          include: {
            lab: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        },
        projects: {
          include: {
            project: {
              select: {
                id: true,
                title: true,
                status: true,
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

  // Get lecturer by ID
  async getLecturerById(id: number) {
    return await prisma.lecturer.findUnique({
      where: { id },
      include: {
        educations: {
          orderBy: { endYear: 'desc' }
        },
        labs: {
          include: {
            lab: true
          }
        },
        projects: {
          include: {
            project: true
          }
        }
      }
    });
  },

  // Get lecturer by shortName
  async getLecturerByShortName(shortName: string) {
    return await prisma.lecturer.findUnique({
      where: { shortName },
      include: {
        educations: {
          orderBy: { endYear: 'desc' }
        },
        labs: {
          include: {
            lab: true
          }
        },
        projects: {
          include: {
            project: true
          }
        }
      }
    });
  },

  // Create lecturer
  async createLecturer(data: CreateLecturerDTO) {
    const { educations, labIds, ...lecturerData } = data;

    // Convert empty strings to null
    const cleanedData: any = {};
    Object.keys(lecturerData).forEach(key => {
      const value = (lecturerData as any)[key];
      cleanedData[key] = value === '' ? null : value;
    });

    return await prisma.lecturer.create({
      data: {
        ...cleanedData,
        educations: educations && educations.length > 0 ? {
          create: educations.map(edu => ({
            degree: edu.degree,
            institution: edu.institution,
            major: edu.major,
            thesisTitle: edu.thesisTitle || null,
            startYear: edu.startYear,
            endYear: edu.endYear,
          }))
        } : undefined,
        labs: labIds && labIds.length > 0 ? {
          create: labIds.map(labId => ({
            labId: labId
          }))
        } : undefined,
      },
      include: {
        educations: true,
        labs: {
          include: {
            lab: true
          }
        }
      }
    });
  },

  // Update lecturer
  async updateLecturer(id: number, data: UpdateLecturerDTO) {
    const { educations, labIds, ...lecturerData } = data;

    // Convert empty strings to null
    const cleanedData: any = {};
    Object.keys(lecturerData).forEach(key => {
      const value = (lecturerData as any)[key];
      cleanedData[key] = value === '' ? null : value;
    });

    // Update lecturer basic data
    const updateData: any = { ...cleanedData };

    // Handle educations update
    if (educations) {
      // Delete all existing educations first
      await prisma.education.deleteMany({
        where: { lecturerId: id }
      });

      // Create new educations
      if (educations.length > 0) {
        updateData.educations = {
          create: educations.map(edu => ({
            degree: edu.degree,
            institution: edu.institution,
            major: edu.major,
            thesisTitle: edu.thesisTitle || null,
            startYear: edu.startYear,
            endYear: edu.endYear,
          }))
        };
      }
    }

    // Handle labs update
    if (labIds !== undefined) {
      // Delete all existing lab relationships
      await prisma.lecturerLab.deleteMany({
        where: { lecturerId: id }
      });

      // Create new lab relationships
      if (labIds.length > 0) {
        updateData.labs = {
          create: labIds.map(labId => ({
            labId: labId
          }))
        };
      }
    }

    return await prisma.lecturer.update({
      where: { id },
      data: updateData,
      include: {
        educations: true,
        labs: {
          include: {
            lab: true
          }
        }
      }
    });
  },

  // Delete lecturer
  async deleteLecturer(id: number) {
    return await prisma.lecturer.delete({
      where: { id }
    });
  },
};
