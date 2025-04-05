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
  participatingAgencies: z.array(
    z.string({ required_error: "กรุณาเลือกหน่วยงานที่ร่วมโครงการ" }),
    {
      required_error: "กรุณาเลือกหน่วยงานที่ร่วมโครงการ",
    },
  ),
  areaId: z.string({ required_error: "กรุณาเลือกพื้นที่จัดโครงการ" }),
  personnelId: z.string({ required_error: "กรุณาเลือกหัวหน้าโครงการ" }),
  owners: z
    .array(z.string({ required_error: "กรุณาเลือกผู้รับผิดชอบโครงการ" }), {
      required_error: "กรุณาเลือกผู้รับผิดชอบโครงการ",
    })
    .nonempty({ message: "กรุณาเลือกผู้รับผิดชอบโครงการ" }),
  indicators: z
    .array(z.string({ required_error: "กรุณาเลือกตัวชี้วัด" }), {
      required_error: "กรุณาเลือกตัวชี้วัด",
    })
    .nonempty({ message: "กรุณาเลือกตัวชี้วัด" }),
  location: z.string({ required_error: "กรุณาระบุสถานที่จัดโครงการ" }),
  typeId: z.string({ required_error: "กรุณาระบุประเภทโครงการ" }),
  project_expenses: z
    .number({ required_error: "กรุณาระบุค่าใช้จ่ายของโครงการ" })
    .optional(),
  project_budget: z.number({ required_error: "กรุณาระบุงบประมาณของโครงการ" }),
  approvalProjectFilePath: z.string({
    required_error: "กรุณาอัปโหลดแบบเสนอขออนุมัติโครงการ",
    message: "กรุณาอัปโหลดแบบเสนอขออนุมัติโครงการ",
  }),
  // supportProjectFilePath: z.string({
  //   required_error: "กรุณาอัปโหลดแบบเสนอขอเงินสนับสนุนโครงการ",
  //   message: "กรุณาอัปโหลดแบบเสนอขอเงินสนับสนุนโครงการ",
  // }),
});

export type ICreateProject = z.infer<typeof CreateProjectSchema>;


export const createProjectTypeSchema = z.object({
  name: z.string({
    description: "ชื่อประเภทโครงการ",
    required_error: "ต้องระบุชื่อประเภทโครงการ",
  }),
});

export type ICreateProjectType = z.infer<typeof createProjectTypeSchema>;