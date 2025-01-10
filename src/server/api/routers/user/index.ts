import { createTRPCRouter } from "@/server/api/trpc";
import { getAllUser, getUserById } from "./GET";
import { createUser, updateUser } from "./POST";
import { deleteUser } from "./DELETE";


export const UserRouter = createTRPCRouter({
  createUser,
  updateUser,
  getAllUser,
  getUserById,
  deleteUser,
});
