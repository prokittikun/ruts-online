import z from "zod";

export const UpdateAgencySchema = z.object({
  id: z.string({
    description: "Agency ID",
    required_error: "ต้องระบุ Agency ID",
  }),
  name: z.string({
    description: "ชื่อหน่วยงาน",
    required_error: "ต้องระบุชื่อหน่วยงาน",
  }),
  email: z.string({ required_error: "กรุณากรอกที่อยู่อีเมล" }).email(),
  tel: z.string({ required_error: "กรุณากรอกเบอร์ติดต่อ" }),
  address: z.string({ required_error: "กรุณากรอกที่อยู่" }),
});

export type IUpdateAgency = z.infer<typeof UpdateAgencySchema>;
