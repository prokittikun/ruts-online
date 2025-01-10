import z from "zod";

export const CreateUserSchema = z.object({
  firstName: z
    .string({
      description: "ชื่อผู้ใช้งาน",
      required_error: "ต้องระบุชื่อผู้ใช้งาน",
    })
    .optional(),
  lastName: z
    .string({
      description: "นามสกุลผู้ใช้งาน",
      required_error: "ต้องระบุนามสกุลผู้ใช้งาน",
    })
    .optional(),
  email: z.string({ required_error: "กรุณากรอกที่อยู่อีเมล" }).email(),
  password: z.string({ required_error: "กรุณากรอกรหัสผ่าน" }),
  tel: z.string({ required_error: "กรุณากรอกเบอร์ติดต่อ" }).optional(),
  role: z.enum(["ADMIN", "PERSONNEL"], { required_error: "กรุณาเลือกตำแหน่ง" }),
});

export type ICreateUser = z.infer<typeof CreateUserSchema>;
