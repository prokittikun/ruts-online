import z from "zod";

export const UpdateAreaSchema = z.object({
  id: z.string({
    description: "Area ID",
    required_error: "ต้องระบุ Area ID",
  }),
  name: z.string({
    description: "ชื่อหน่วยงาน",
    required_error: "ต้องระบุชื่อหน่วยงาน",
  }),
  tel: z.string({ required_error: "กรุณากรอกเบอร์ติดต่อ" }),
  address: z.string({ required_error: "กรุณากรอกที่อยู่" }),
});

export type IUpdateArea = z.infer<typeof UpdateAreaSchema>;
