import { createTRPCRouter } from "@/server/api/trpc";
import { getAllArea, getAllAreaPaginate, getAreaById } from "./GET";
import { createArea, updateArea } from "./POST";
import { deleteArea } from "./DELETE";

export const AreaRouter = createTRPCRouter({
    createArea,
    updateArea,
    deleteArea,
    getAllArea,
    getAllAreaPaginate,
    getAreaById,
});
