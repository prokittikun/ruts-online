import { CreateProjectSchema } from "@/schemas/projects/createProject";
import { UpdateProjectSchema } from "@/schemas/projects/updateProject";
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
      } = input;
      return await ctx.db.project.update({
        where: {
          id,
        },
        data: {
          name,
          detail,
          date_end_the_project,
          date_start_the_project,
          location,
          project_expenses,
          project_budget,
          project_status: "PENDING",
          project_type: {
            connect: {
              id: typeId,
            },
          },
        },
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
          project_status: ProjectStatus.IN_PROGRESS
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
          project_status: ProjectStatus.REJECT
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
          project_status: ProjectStatus.PENDING
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
          project_status: ProjectStatus.CANCELED
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
          project_status: ProjectStatus.COMPLETED
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
    }
  });

  