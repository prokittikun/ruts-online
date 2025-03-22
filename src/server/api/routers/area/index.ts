import { createTRPCRouter } from "@/server/api/trpc";
import { getAllArea } from "./GET";

export const AreaRouter = createTRPCRouter({
    getAllArea
});
