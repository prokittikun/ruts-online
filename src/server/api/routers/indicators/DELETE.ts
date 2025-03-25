import { protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";
const pt = protectedProcedure;
const pb = publicProcedure;

export const deleteIndicator = pt
  .input(
    z.string()
  )
  .mutation(async ({ ctx, input }) => {
    try {
      return await ctx.db.indicators.delete({
        where: {
            id: input
        }
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
    }
  });
