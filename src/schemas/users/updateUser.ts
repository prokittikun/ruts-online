import z from "zod";
import { CreateUserSchema } from "./createUser";

export const UpdateUserSchema = CreateUserSchema.omit({
  email: true,
  password: true, // First omit the password field
  role: true
}).extend({
  id: z.string({
    description: "User ID",
    required_error: "ต้องระบุ User ID",
  }),
  email: z.string().email().optional(),
  password: z.string().optional(),
  role: z.enum(["ADMIN", "PERSONNEL"]).optional(),

});

export type IUpdateUser = z.infer<typeof UpdateUserSchema>;
