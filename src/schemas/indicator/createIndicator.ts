import z from "zod";

export const CreateIndicatorSchema = z.object({
  name: z.string({
    description: "ชื่อตัวชี้วัด",
    required_error: "ต้องระบุชื่อตัวชี้วัด",
  }),
});

export type ICreateIndicator = z.infer<typeof CreateIndicatorSchema>;
