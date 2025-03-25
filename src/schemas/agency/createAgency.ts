import z from "zod";

export const CreateAgencySchema = z.object({
  name: z.string({
    description: "ชื่อหน่วยงาน",
    required_error: "ต้องระบุชื่อหน่วยงาน",
  }),
  email: z.string({ required_error: "กรุณากรอกที่อยู่อีเมล" }).email(),
  tel: z.string({ required_error: "กรุณากรอกเบอร์ติดต่อ" }),
  address: z.string({ required_error: "กรุณากรอกที่อยู่" }),
});

export type ICreateAgency = z.infer<typeof CreateAgencySchema>;
