import z from "zod";

export const CreateProjectSchema = z.object({
  name: z
    .string({
      description: "ชื่อโครงการ",
      required_error: "ต้องระบุชื่อโครงการ",
    })
    .min(1, { message: "ต้องมากกว่า 1 ตัวอักษร" }),
  detail: z.string({ required_error: "กรุณากรอกรายละโครงการ" }),
  date_start_the_project: z.date({
    description: "วัน เดือน ปี (จัดโครงการ)",
  }),
  date_end_the_project: z.date({
    description: "วัน เดือน ปี (สิ้นสุดโครงการ)",
  }),
  location: z.string({ required_error: "กรุณาระบุสถานที่จัดโครงการ" }),
  typeId: z.string({ required_error: "กรุณาระบุประเภทโครงการ" }),
  project_expenses: z.number({ required_error: "กรุณาระบุค่าใช้จ่ายของโครงการ" }).optional(),
  project_budget: z.number({ required_error: "กรุณาระบุงบประมาณของโครงการ" }),
});

export type ICreateProject = z.infer<typeof CreateProjectSchema>;