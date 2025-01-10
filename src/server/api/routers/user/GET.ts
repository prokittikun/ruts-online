import { CreateProjectSchema } from "@/schemas/projects/createProject";
import { protectedProcedure, publicProcedure } from "@/server/api/trpc";
import paginationCalculator from "@/utils/paginationCalculator";
import { User } from "@prisma/client";
import { z } from "zod";
const pb = publicProcedure;

export const getAllUser = pb
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

      const totalItems = await ctx.db.user.count({
        where: {
          OR: [
            {
              first_name: {
                contains: keyword ?? "",
              },
              // last_name: {
              //   contains: keyword ?? "",
              // },
              email: {
                contains: keyword ?? "",
              },
            },
          ],
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      const paginate = paginationCalculator(
        totalItems,
        perPages || 10,
        currentPage || 1,
      );

      const result = await ctx.db.user.findMany({
        where: {
          OR: [
            {
              first_name: {
                contains: keyword ?? "",
              },
              // last_name: {
              //   contains: keyword ?? "",
              // },
              email: {
                contains: keyword ?? "",
              },
            },
          ],
        },
        skip: paginate.skips,
        take: paginate.limit,
        orderBy: {
          createdAt: "desc",
        },
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

export const getUserById = pb
  .input(z.string())
  .mutation(async ({ ctx, input }) => {
    try {
      const result = await ctx.db.user.findUnique({
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
