import { CreateAgencySchema } from "@/schemas/agency/createAgency";
import { UpdateAgencySchema } from "@/schemas/agency/updateAgency";
import {
  adminProcedure,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
const pt = protectedProcedure;
const pb = publicProcedure;
const am = adminProcedure;

export const createAgency = am
  .input(CreateAgencySchema)
  .mutation(async ({ ctx, input }) => {
    try {
      return await ctx.db.agency.create({
        data: {
          name: input.name,
          email: input.email,
          tel: input.tel,
          address: input.address,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
    }
  });

export const updateAgency = am
  .input(UpdateAgencySchema)
  .mutation(async ({ ctx, input }) => {
    try {
      return await ctx.db.agency.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          email: input.email,
          tel: input.tel,
          address: input.address,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
    }
  });
