import { createTRPCRouter } from "@/server/api/trpc";
import { getAllProject, getAllProjectTypePaginate, getProjectById, getProjectType, getProjectTypeById } from "./GET";
import { approveProject, cancelProject, completedProject, createProject, createProjectType, rejectProject, resentProject, updateProject, updateProjectType } from "./POST";
import { deleteProject, deleteProjectType } from "./DELETE";

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
  completedProject,
  createProjectType,
  updateProjectType,
  deleteProjectType,
  getAllProjectTypePaginate,
  getProjectTypeById,
});
