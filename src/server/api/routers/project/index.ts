import { createTRPCRouter } from "@/server/api/trpc";
import { getAllProject, getProjectById, getProjectType } from "./GET";
import { approveProject, createProject, rejectProject, updateProject } from "./POST";
import { deleteProject } from "./DELETE";

export const ProjectRouter = createTRPCRouter({
  createProject,
  updateProject,
  deleteProject,
  getAllProject,
  getProjectById,
  getProjectType,
  approveProject,
  rejectProject
  // updateEquipment: updateEquipment,
  // deleteEquipment: deleteEquipment,
});
