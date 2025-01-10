import { CreateProjectSchema } from "@/schemas/projects/createProject";
import { UpdateProjectSchema } from "@/schemas/projects/updateProject";
import { CreateUserSchema } from "@/schemas/users/createUser";
import { UpdateUserSchema } from "@/schemas/users/updateUser";
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

export const createUser = am
  .input(CreateUserSchema)
  .mutation(async ({ ctx, input }) => {
    try {
      const { firstName, lastName, email, password, tel, role } = input;
      return await ctx.db.user.create({
        data: {
          first_name: firstName,
          last_name: lastName,
          email: email,
          password: password,
          tel: tel,
          role: role,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
    }
  });

export const updateUser = pt
  .input(UpdateUserSchema)
  .mutation(async ({ ctx, input }) => {
    try {
      const { id, firstName, lastName, email, password, tel, role } = input;
      return await ctx.db.user.update({
        where: {
          id: id,
        },
        data: {
          first_name: firstName,
          last_name: lastName,
          email: email,
          password: password,
          tel: tel,
          role: role,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
    }
  });