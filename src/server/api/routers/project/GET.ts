import { CreateProjectSchema } from "@/schemas/projects/createProject";
import { protectedProcedure, publicProcedure } from "@/server/api/trpc";
import paginationCalculator from "@/utils/paginationCalculator";
import { z } from "zod";
const pb = publicProcedure;

export const getAllProject = pb
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

      const totalItems = await ctx.db.project.count({
        where: {
          name: {
            contains: keyword ?? "",
          },
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

      const result = await ctx.db.project.findMany({
        where: {
          name: {
            contains: keyword ?? "",
          },
        },
        skip: paginate.skips,
        take: paginate.limit,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          project_type: true,
          user: true,
        }
      });
      const itemPerpage = result.length;
      const res = {
        totalItems: totalItems,
        itemsPerPage: itemPerpage,
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

export const getProjectType = pb.query(async ({ ctx, input }) => {
  try {
    const result = await ctx.db.projectType.findMany();
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
  }
});

export const getProjectById = pb.input(z.string()).mutation(async ({ ctx, input }) => {
  try {
    const result = await ctx.db.project.findUnique({
      where: {
        id: input,
      },
      include: {
        project_type: true,
        user: true,
      },
    });
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
  }
});