import { CreateDepartmentSchema } from "@/schemas/department/createDepartment";
import { UpdateDepartmentSchema } from "@/schemas/department/updateDepartment";
import {
  adminProcedure,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
const pt = protectedProcedure;
const pb = publicProcedure;
const am = adminProcedure;

export const createDepartment = am
  .input(CreateDepartmentSchema)
  .mutation(async ({ ctx, input }) => {
    try {
      return await ctx.db.department.create({
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

export const updateDepartment = am
  .input(UpdateDepartmentSchema)
  .mutation(async ({ ctx, input }) => {
    try {
      return await ctx.db.department.update({
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
