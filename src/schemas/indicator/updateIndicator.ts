import z from "zod";

export const UpdateIndicatorSchema = z.object({
  id: z.string({
    description: "Indicator ID",
    required_error: "ต้องระบุ Indicator ID",
  }),
  name: z.string({
    description: "ชื่อตัวชี้วัด",
    required_error: "ต้องระบุชื่อตัวชี้วัด",
  }),
});

export type IUpdateIndicator = z.infer<typeof UpdateIndicatorSchema>;
