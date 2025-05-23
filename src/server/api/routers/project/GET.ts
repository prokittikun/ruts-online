import { CreateProjectSchema } from "@/schemas/projects/createProject";
import { protectedProcedure, publicProcedure } from "@/server/api/trpc";
import paginationCalculator from "@/utils/paginationCalculator";
import { ProjectStatus } from "@prisma/client";
import { _TRN_X501AttributeTypeAndValueGetAttributeTypeOID } from "public/webviewer/lib/core/pdf/full/PDFNetCWasm";
import { z } from "zod";
const pb = publicProcedure;

export const getAllProject = pb
  .input(
    z.object({
      perPages: z.number(),
      currentPage: z.number(),
      keyword: z.string().optional(),
      status: z.array(z.nativeEnum(ProjectStatus)).optional(),
      personnelId: z.number().optional(),
    }),
  )
  .query(async ({ ctx, input }) => {
    try {
      console.log("input");
      const { perPages, currentPage, keyword, status, personnelId } = input;

      const totalItems = await ctx.db.project.count({
        where: {
          AND: [
            keyword
              ? {
                  OR: [
                    { name: { contains: keyword } },
                    { detail: { contains: keyword } },
                  ],
                }
              : {},
            status && status.length > 0
              ? {
                  project_status: {
                    in: status as ProjectStatus[],
                  },
                }
              : {},
          ],
          ...(personnelId && { personnelId: personnelId }),
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
          AND: [
            keyword
              ? {
                  OR: [
                    { name: { contains: keyword } },
                    { detail: { contains: keyword } },
                  ],
                }
              : {},
            status && status.length > 0
              ? {
                  project_status: {
                    in: status as ProjectStatus[],
                  },
                }
              : {},
          ],
          ...(personnelId && { personnelId: personnelId }),
        },
        skip: paginate.skips,
        take: paginate.limit,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          project_type: true,
          Personnel: true,
        },
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

export const getProjectById = pb
  .input(z.number())
  .mutation(async ({ ctx, input }) => {
    try {
      const result = await ctx.db.project.findUnique({
        where: {
          id: input,
        },
        include: {
          project_type: true,
          Personnel: true,
          Assemble: {
            include: {
              indicator: true,
            },
          },
          Participating_agencies: {
            include: {
              agency: true,
            },
          },
          Owner: {
            include: {
              personnel: true,
            },
          },
        },
      });
      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
    }
  });

export const getAllProjectTypePaginate = pb
  .input(
    z.object({
      perPages: z.number(),
      currentPage: z.number(),
      keyword: z.string().optional(),
    }),
  )
  .query(async ({ ctx, input }) => {
    try {
      const { perPages, currentPage, keyword } = input;

      const totalItems = await ctx.db.projectType.count({
        where: {
          name: {
            contains: keyword,
          },
        },
      });

      const paginate = paginationCalculator(
        totalItems,
        perPages || 10,
        currentPage || 1,
      );

      const result = await ctx.db.projectType.findMany({
        where: {
          name: {
            contains: keyword,
          },
        },
        skip: paginate.skips,
        take: paginate.limit,
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

export const getProjectTypeById = pb
  .input(z.string())
  .mutation(async ({ ctx, input }) => {
    try {
      const result = await ctx.db.projectType.findUnique({
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

export const getAllProjectForReport = pb
  .input(
    z.object({
      status: z.string().optional(),
      typeId: z.string().optional(),
      year: z.string().optional(),
    }),
  )
  .query(async ({ ctx, input }) => {
    try {
      const result = await ctx.db.project.findMany({
        where: {
          project_status: input.status ? (input.status as ProjectStatus) : undefined,
          project_type: {
            id: input.typeId ? input.typeId : undefined,
          },
          fiscal_year: input.year ? Number(input.year) : undefined,
        },
        include: {
          project_type: true,
          Personnel: {
            include: {
              Department: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
    }
  });

export const getAllProjectType = pb.query(async ({ ctx, input }) => {
  try {
    const result = await ctx.db.projectType.findMany();
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
  }
});
