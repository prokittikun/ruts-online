import { Role } from "@prisma/client";

const RoleMap: {
  role: Role;
  color: string;
  description?: string;
}[] = [
  {
    color: "cyan",
    role: Role.ADMIN,
    description: "ผู้ดูแลระบบ",
  },
  {
    color: "blue",
    role: Role.PERSONNEL,
    description: "บุคลากร",
  },
];

export const FindRole = (role: Role | null) => {
  return RoleMap.find((item) => item.role === role);
};

export default RoleMap;
