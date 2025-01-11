import { createTRPCRouter } from "@/server/api/trpc";
import { getAllProject, getProjectById, getProjectType } from "./GET";
import { approveProject, cancelProject, completedProject, createProject, rejectProject, resentProject, updateProject } from "./POST";
import { deleteProject } from "./DELETE";

export const ProjectRouter = createTRPCRouter({
  createProject,
  updateProject,
  deleteProject,
  getAllProject,
  getProjectById,
  getProjectType,
  approveProject,
  rejectProject,
  resentProject,
  cancelProject,
  completedProject
  // updateEquipment: updateEquipment,
  // deleteEquipment: deleteEquipment,
});
