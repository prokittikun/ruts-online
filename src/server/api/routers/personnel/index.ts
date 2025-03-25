import { createTRPCRouter } from "@/server/api/trpc";
import { getAllPersonnel, getAllPersonnelPaginate, getPersonnelById } from "./GET";
import { createPersonnel, updatePersonnel } from "./POST";
import { deletePersonnel } from "./DELETE";

export const PersonnelRouter = createTRPCRouter({
    createPersonnel,
    updatePersonnel,
    getAllPersonnel,
    getAllPersonnelPaginate,
    getPersonnelById,
    deletePersonnel
});
