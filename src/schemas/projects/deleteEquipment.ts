import z from "zod";

export const DeleteEquipmentSchema = z.object({
  id: z
    .number({
      description: "Euipment ID",
      required_error: "ต้องระบุ Equipment ID",
    })
});

export type IDeleteEquipment = z.infer<typeof DeleteEquipmentSchema>;