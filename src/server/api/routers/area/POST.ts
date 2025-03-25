import { CreateAreaSchema } from "@/schemas/area/createArea";
import { UpdateAreaSchema } from "@/schemas/area/updateArea";
import {
  adminProcedure,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
const pt = protectedProcedure;
const pb = publicProcedure;
const am = adminProcedure;

export const createArea = am
  .input(CreateAreaSchema)
  .mutation(async ({ ctx, input }) => {
    try {
      return await ctx.db.area.create({
        data: {
          name: input.name,
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

export const updateArea = am
  .input(UpdateAreaSchema)
  .mutation(async ({ ctx, input }) => {
    try {
      return await ctx.db.area.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
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
