import { CreateProjectSchema } from "@/schemas/projects/createProject";
import { protectedProcedure, publicProcedure } from "@/server/api/trpc";
import paginationCalculator from "@/utils/paginationCalculator";
import { ProjectStatus } from "@prisma/client";
import { z } from "zod";
const pb = publicProcedure;

export const getAllArea = pb.query(async ({ ctx, input }) => {
  try {
    const result = await ctx.db.area.findMany();
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
  }
});
