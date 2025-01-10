import z from "zod";
import { CreateUserSchema } from "./createUser";

export const UpdateUserSchema = CreateUserSchema.extend({
  id: z.string({
    description: "User ID",
    required_error: "ต้องระบุ User ID",
  })
});

export type IUpdateUser = z.infer<typeof UpdateUserSchema>;