import { createTRPCRouter } from "@/server/api/trpc";
import { getAllProject, getProjectById, getProjectType } from "./GET";
import { createProject, updateProject } from "./POST";
import { deleteProject } from "./DELETE";

export const ProjectRouter = createTRPCRouter({
  createProject,
  updateProject,
  deleteProject,
  getAllProject,
  getProjectById,
  getProjectType
  // updateEquipment: updateEquipment,
  // deleteEquipment: deleteEquipment,
});
