import { z } from "zod";

export const SignInSchema = z.object({
  email: z.string().email({message: "รูปแบบอีเมลไม่ถูกต้อง"}).min(1, { message: "กรุณาระบุอีเมล" }),
  password: z.string().min(1, { message: "กรุณาระบุรหัสผ่าน" }),
});

export type ISignIn = z.infer<typeof SignInSchema>;
