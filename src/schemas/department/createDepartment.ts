import z from "zod";

export const CreateDepartmentSchema = z.object({
  name: z.string({
    description: "ชื่อสาขา",
    required_error: "ต้องระบุชื่อสาขา",
  }),
});

export type ICreateDepartment = z.infer<typeof CreateDepartmentSchema>;
