import { CreateIndicatorSchema } from "@/schemas/indicator/createIndicator";
import { UpdateIndicatorSchema } from "@/schemas/indicator/updateIndicator";
import {
  adminProcedure,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
const pt = protectedProcedure;
const pb = publicProcedure;
const am = adminProcedure;

export const createIndicator = am
  .input(CreateIndicatorSchema)
  .mutation(async ({ ctx, input }) => {
    try {
      return await ctx.db.indicators.create({
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

export const updateIndicator = am
  .input(UpdateIndicatorSchema)
  .mutation(async ({ ctx, input }) => {
    try {
      return await ctx.db.indicators.update({
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
