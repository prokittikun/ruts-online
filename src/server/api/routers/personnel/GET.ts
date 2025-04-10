import { publicProcedure } from "@/server/api/trpc";
import paginationCalculator from "@/utils/paginationCalculator";
import { type Role } from "@prisma/client";
import { z } from "zod";
const pb = publicProcedure;

export const getAllPersonnel = pb
  .input(
    z
      .object({
        role: z.string().optional(),
      })
      .optional(),
  )
  .query(async ({ ctx, input }) => {
    try {
      const result = await ctx.db.personnel.findMany({
        where: {
          ...(input?.role ? { role: input.role as Role } : {}),
        },
      });
      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
    }
  });

export const getAllPersonnelPaginate = pb
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

      const totalItems = await ctx.db.personnel.count({
        where: {
          first_name: {
            contains: keyword ?? "",
          },
        },
      });
      const paginate = paginationCalculator(
        totalItems,
        perPages || 10,
        currentPage || 1,
      );

      const result = await ctx.db.personnel.findMany({
        where: {
          first_name: {
            contains: keyword ?? "",
          },
        },
        skip: paginate.skips,
        take: paginate.limit,
        include: {
          Department: true,
        },
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

export const getPersonnelById = pb
  .input(z.number())
  .mutation(async ({ ctx, input }) => {
    try {
      const result = await ctx.db.personnel.findUnique({
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
