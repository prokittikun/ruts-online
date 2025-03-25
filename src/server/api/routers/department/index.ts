import { createTRPCRouter } from "@/server/api/trpc";
import { getAllDepartment, getAllDepartmentPaginate, getDepartmentById } from "./GET";
import { createDepartment, updateDepartment } from "./POST";
import { deleteDepartment } from "./DELETE";

export const DepartmentRouter = createTRPCRouter({
    createDepartment,
    updateDepartment,
    deleteDepartment,
    getAllDepartment,
    getAllDepartmentPaginate,
    getDepartmentById,
});
