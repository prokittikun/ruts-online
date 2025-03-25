import { createTRPCRouter } from "@/server/api/trpc";
import { getAgencyById, getAllAgency, getAllAgencyPaginate } from "./GET";
import { createAgency, updateAgency } from "./POST";
import { deleteAgency } from "./DELETE";

export const AgencyRouter = createTRPCRouter({
    createAgency,
    updateAgency,
    deleteAgency,
    getAllAgency,
    getAllAgencyPaginate,
    getAgencyById,
});
