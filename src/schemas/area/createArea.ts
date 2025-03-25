import z from "zod";

export const CreateAreaSchema = z.object({
  name: z.string({
    description: "ชื่อหน่วยงาน",
    required_error: "ต้องระบุชื่อหน่วยงาน",
  }),
  tel: z.string({ required_error: "กรุณากรอกเบอร์ติดต่อ" }),
  address: z.string({ required_error: "กรุณากรอกที่อยู่" }),
});

export type ICreateArea = z.infer<typeof CreateAreaSchema>;
