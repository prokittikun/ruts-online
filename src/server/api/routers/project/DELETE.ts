import {
  adminProcedure,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { z } from "zod";
const pt = protectedProcedure;
const pb = publicProcedure;
const am = adminProcedure;
export const deleteProject = pt
  .input(z.number())
  .mutation(async ({ ctx, input }) => {
    try {
      return await ctx.db.project.delete({
        where: {
          id: input,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
    }
  });

export const deleteProjectType = am
  .input(z.string())
  .mutation(async ({ ctx, input }) => {
    try {
      return await ctx.db.projectType.delete({
        where: {
          id: input,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
    }
  });
