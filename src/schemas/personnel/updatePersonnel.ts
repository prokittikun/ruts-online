import z from "zod";

export const UpdatePersonnelSchema = z.object({
  id: z.string({
    description: "Project ID",
    required_error: "ต้องระบุ Project ID",
  }),
  name: z.string({
    description: "ชื่อผู้ใช้งาน",
    required_error: "ต้องระบุชื่อผู้ใช้งาน",
  }),
  email: z.string({ required_error: "กรุณากรอกที่อยู่อีเมล" }).email(),
  tel: z.string({ required_error: "กรุณากรอกเบอร์ติดต่อ" }),
  address: z.string({ required_error: "กรุณากรอกที่อยู่" }),
  departmentId: z.string({ required_error: "กรุณาเลือกสาขา" }),
});

export type IUpdatePersonnel = z.infer<typeof UpdatePersonnelSchema>;
