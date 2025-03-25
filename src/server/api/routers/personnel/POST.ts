import { CreatePersonnelSchema } from "@/schemas/personnel/createPersonnel";
import { UpdatePersonnelSchema } from "@/schemas/personnel/updatePersonnel";
import {
  adminProcedure,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
const pt = protectedProcedure;
const pb = publicProcedure;
const am = adminProcedure;

export const createPersonnel = am
  .input(CreatePersonnelSchema)
  .mutation(async ({ ctx, input }) => {
    try {
      const { name, email, address, tel, departmentId } = input;
      return await ctx.db.personnel.create({
        data: {
          name: name,
          email: email,
          tel: tel,
          address: address,
          Department: {
            connect: {
              id: departmentId,
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

export const updatePersonnel = pt
  .input(UpdatePersonnelSchema)
  .mutation(async ({ ctx, input }) => {
    try {
      const { id, name, email, address, tel, departmentId } = input;
      return await ctx.db.personnel.update({
        where: {
          id: id,
        },
        data: {
          name: name,
          email: email,
          tel: tel,
          address: address,
          Department: {
            connect: {
              id: departmentId,
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
