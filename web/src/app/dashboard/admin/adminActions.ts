"use server";

import { getUser } from "@/lib/auth/userFromToken";
import { getAllUsers, deleteUser, setUserTier } from "@/lib/repository/user/userRepository";
import { User } from "@/lib/repository/user/userSchemas";

export async function getAllUsersAction(): Promise<User[]> {
  const user = await getUser();
  if (!user?.is_admin) throw new Error("Unauthorized");
  return getAllUsers();
}

export async function upgradeUserAction(userId: string): Promise<void> {
  const user = await getUser();
  if (!user?.is_admin) throw new Error("Unauthorized");
  const updated = await setUserTier(userId, "pro");
  if (!updated) throw new Error("User not found");
}

export async function downgradeUserAction(userId: string): Promise<void> {
  const user = await getUser();
  if (!user?.is_admin) throw new Error("Unauthorized");
  const updated = await setUserTier(userId, "free");
  if (!updated) throw new Error("User not found");
}

export async function deleteUserAction(userId: string): Promise<void> {
  const user = await getUser();
  if (!user?.is_admin) throw new Error("Unauthorized");
  if (user.id === userId) throw new Error("Cannot delete your own account");
  await deleteUser(userId);
}
