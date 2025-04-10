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
      const {
        firstName,
        lastName,
        email,
        password,
        address,
        tel,
        departmentId,
        role,
      } = input;
      return await ctx.db.personnel.create({
        data: {
          first_name: firstName,
          last_name: lastName,
          email: email,
          password: password,
          role: role,
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
      const {
        id,
        firstName,
        lastName,
        email,
        password,
        address,
        tel,
        departmentId,
        role,
      } = input;
      return await ctx.db.personnel.update({
        where: {
          id: id,
        },
        data: {
          first_name: firstName,
          last_name: lastName,
          email: email,
          password: password,
          tel: tel,
          address: address,
          Department: {
            connect: {
              id: departmentId,
            },
          },
          role: role,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
    }
  });
