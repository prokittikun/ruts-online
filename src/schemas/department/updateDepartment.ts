import z from "zod";

export const UpdateDepartmentSchema = z.object({
  id: z.string({
    description: "Department ID",
    required_error: "ต้องระบุ Department ID",
  }),
  name: z.string({
    description: "ชื่อสาขา",
    required_error: "ต้องระบุชื่อสาขา",
  }),
});

export type IUpdateDepartment = z.infer<typeof UpdateDepartmentSchema>;
