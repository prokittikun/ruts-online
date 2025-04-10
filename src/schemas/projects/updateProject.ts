import z from "zod";
import { CreateProjectSchema } from "./createProject";

export const UpdateProjectSchema = CreateProjectSchema.extend({
  id: z.number({
    description: "Project ID",
    required_error: "ต้องระบุ Project ID",
  }),
});

export type IUpdateProject = z.infer<typeof UpdateProjectSchema>;

export const UpdateProjectTypeSchema = z.object({
  id: z.string({
    description: "ID ประเภทโครงการ ",
    required_error: "ต้องระบุIDประเภทโครงการ",
  }),
  name: z.string({
    description: "ชื่อประเภทโครงการ",
    required_error: "ต้องระบุชื่อประเภทโครงการ",
  }),
});

export type IUpdateProjectType = z.infer<typeof UpdateProjectTypeSchema>;
