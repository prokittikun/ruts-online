import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { AreaRouter } from "./routers/area";
import { PersonnelRouter } from "./routers/personnel";
import { ProjectRouter } from "./routers/project";
import { AgencyRouter } from "./routers/agency";
import { IndicatorRouter } from "./routers/indicators";
import { DepartmentRouter } from "./routers/department";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  project: ProjectRouter,
  area: AreaRouter,
  personnel: PersonnelRouter,
  agency: AgencyRouter,
  indicator: IndicatorRouter,
  department: DepartmentRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
