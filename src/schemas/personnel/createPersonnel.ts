import z from "zod";

export const CreatePersonnelSchema = z.object({
  firstName: z.string({
    description: "ชื่อผู้ใช้งาน",
    required_error: "ต้องระบุชื่อผู้ใช้งาน",
  }),
  lastName: z.string({
    description: "นามสกุลผู้ใช้งาน",
    required_error: "ต้องระบุนามสกุลผู้ใช้งาน",
  }),
  email: z.string({ required_error: "กรุณากรอกที่อยู่อีเมล" }).email(),
  password: z.string({
    description: "รหัสผ่าน",
    required_error: "ต้องระบุรหัสผ่าน",
  }),
  tel: z.string({ required_error: "กรุณากรอกเบอร์ติดต่อ" }),
  address: z.string({ required_error: "กรุณากรอกที่อยู่" }),
  departmentId: z.string({ required_error: "กรุณาเลือกสาขา" }).optional(),
  role: z.enum(["ADMIN", "PERSONNEL"], { required_error: "กรุณาเลือกตำแหน่ง" }),
});

export type ICreatePersonnel = z.infer<typeof CreatePersonnelSchema>;
