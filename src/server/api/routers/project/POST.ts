import {
  CreateProjectSchema,
  createProjectTypeSchema,
} from "@/schemas/projects/createProject";
import {
  UpdateProjectSchema,
  UpdateProjectTypeSchema,
} from "@/schemas/projects/updateProject";
import {
  adminProcedure,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { ProjectStatus } from "@prisma/client";
import { z } from "zod";
const pt = protectedProcedure;
const pb = publicProcedure;
const am = adminProcedure;

export const createProject = pt
  .input(CreateProjectSchema)
  .mutation(async ({ ctx, input }) => {
    try {
      const {
        name,
        detail,
        typeId,
        date_end_the_project,
        date_start_the_project,
        location,
        project_expenses = 0,
        project_budget,
        participatingAgencies,
        areaId,
        personnelId,
        indicators,
        approvalProjectFilePath,
      } = input;
      return await ctx.db.project.create({
        data: {
          name,
          detail,
          date_end_the_project,
          date_start_the_project,
          location,
          project_expenses,
          project_budget,
          project_status: "PENDING",
          user: {
            connect: {
              id: ctx.session.user.id,
            },
          },
          project_type: {
            connect: {
              id: typeId,
            },
          },
          Area: {
            connect: {
              id: areaId,
            },
          },
          Personnel: {
            connect: {
              id: personnelId,
            },
          },
          Participating_agencies: {
            create: participatingAgencies.map((agencyId) => ({
              agency: {
                connect: {
                  id: agencyId,
                },
              },
              assignedAt: new Date(),
              assignedBy: ctx.session.user.id, // Assuming the user assigns the agency
            })),
          },
          Assemble: {
            create: indicators.map((indicatorId) => ({
              name: "",
              indicator: {
                connect: {
                  id: indicatorId,
                },
              },
            })),
          },
          approvalProjectFilePath: approvalProjectFilePath,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
    }
  });

export const updateProject = pt
  .input(UpdateProjectSchema)
  .mutation(async ({ ctx, input }) => {
    try {
      const {
        id,
        name,
        detail,
        typeId,
        date_end_the_project,
        date_start_the_project,
        location,
        project_expenses = 0,
        project_budget,
        participatingAgencies,
        areaId,
        personnelId,
        indicators,
        approvalProjectFilePath,
      } = input;

      // Define a properly typed update data object
      const updateData = {
        name,
        detail,
        date_end_the_project,
        date_start_the_project,
        location,
        project_expenses,
        project_budget,
        project_status: "PENDING" as const,
        project_type: {
          connect: {
            id: typeId,
          },
        },
        ...(areaId
          ? {
              Area: {
                connect: {
                  id: areaId,
                },
              },
            }
          : {}),
        ...(personnelId
          ? {
              Personnel: {
                connect: {
                  id: personnelId,
                },
              },
            }
          : {}),
        ...(approvalProjectFilePath ? { approvalProjectFilePath } : {}),
      };

      // Handle many-to-many relationships outside the initial object
      if (participatingAgencies && participatingAgencies.length > 0) {
        // First delete existing relationships
        await ctx.db.participating_agencies.deleteMany({
          where: {
            projectId: id,
          },
        });

        // Add participating agencies to update data
        Object.assign(updateData, {
          Participating_agencies: {
            create: participatingAgencies.map((agencyId) => ({
              agency: {
                connect: {
                  id: agencyId,
                },
              },
              assignedAt: new Date(),
              assignedBy: ctx.session.user.id,
            })),
          },
        });
      }

      if (indicators && indicators.length > 0) {
        // First delete existing relationships
        await ctx.db.assemble.deleteMany({
          where: {
            projectId: id,
          },
        });

        // Add indicators to update data
        Object.assign(updateData, {
          Assemble: {
            create: indicators.map((indicatorId) => ({
              name: "",
              indicator: {
                connect: {
                  id: indicatorId,
                },
              },
            })),
          },
        });
      }

      return await ctx.db.project.update({
        where: {
          id,
        },
        data: updateData,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
    }
  });
export const approveProject = am
  .input(z.string())
  .mutation(async ({ ctx, input }) => {
    try {
      return await ctx.db.project.update({
        where: {
          id: input,
        },
        data: {
          project_status: ProjectStatus.IN_PROGRESS,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
    }
  });

export const rejectProject = am
  .input(z.string())
  .mutation(async ({ ctx, input }) => {
    try {
      return await ctx.db.project.update({
        where: {
          id: input,
        },
        data: {
          project_status: ProjectStatus.REJECT,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
    }
  });
export const resentProject = pt
  .input(z.string())
  .mutation(async ({ ctx, input }) => {
    try {
      return await ctx.db.project.update({
        where: {
          id: input,
        },
        data: {
          project_status: ProjectStatus.PENDING,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
    }
  });
export const cancelProject = pt
  .input(z.string())
  .mutation(async ({ ctx, input }) => {
    try {
      return await ctx.db.project.update({
        where: {
          id: input,
        },
        data: {
          project_status: ProjectStatus.CANCELED,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
    }
  });
export const completedProject = pt
  .input(z.string())
  .mutation(async ({ ctx, input }) => {
    try {
      return await ctx.db.project.update({
        where: {
          id: input,
        },
        data: {
          project_status: ProjectStatus.COMPLETED,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
    }
  });

export const createProjectType = am
  .input(createProjectTypeSchema)
  .mutation(async ({ ctx, input }) => {
    try {
      return await ctx.db.projectType.create({
        data: {
          name: input.name,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
    }
  });

export const updateProjectType = am
  .input(UpdateProjectTypeSchema)
  .mutation(async ({ ctx, input }) => {
    try {
      return await ctx.db.projectType.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
    }
  });
