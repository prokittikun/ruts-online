import z from "zod";
import { CreateProjectSchema } from "./createProject";

export const UpdateProjectSchema = CreateProjectSchema.extend({
  id: z.string({
    description: "Project ID",
    required_error: "ต้องระบุ Project ID",
  })
});

export type IUpdateProject = z.infer<typeof UpdateProjectSchema>;