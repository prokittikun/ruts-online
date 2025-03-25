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

export const getAllAreaPaginate = pb
  .input(
    z.object({
      perPages: z.number(),
      currentPage: z.number(),
      keyword: z.string().optional(),
    }),
  )
  .query(async ({ ctx, input }) => {
    try {
      console.log("input");
      const { perPages, currentPage, keyword } = input;

      const totalItems = await ctx.db.area.count({
        where: {
          name: {
            contains: keyword ?? "",
          },
        },
      });
      const paginate = paginationCalculator(
        totalItems,
        perPages || 10,
        currentPage || 1,
      );

      const result = await ctx.db.area.findMany({
        where: {
          name: {
            contains: keyword ?? "",
          },
        },
        skip: paginate.skips,
        take: paginate.limit,
        // orderBy: {
        //   createdAt: "desc",
        // },
      });
      const itemPerPage = result.length;
      const res = {
        totalItems: totalItems,
        itemsPerPage: itemPerPage,
        totalPages: paginate.totalPages,
        currentPage: currentPage,
        data: result,
      };
      return res;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
    }
  });

export const getAreaById = pb
  .input(z.string())
  .mutation(async ({ ctx, input }) => {
    try {
      const result = await ctx.db.area.findUnique({
        where: {
          id: input,
        },
      });
      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
    }
  });
