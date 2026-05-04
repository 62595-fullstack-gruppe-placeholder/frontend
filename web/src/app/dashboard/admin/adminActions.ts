"use server";

import { getUser } from "@/lib/auth/userFromToken";
import { getAllUsers, deleteUser } from "@/lib/repository/user/userRepository";
import { User } from "@/lib/repository/user/userSchemas";

export async function getAllUsersAction(): Promise<User[]> {
  const user = await getUser();
  if (!user?.is_admin) throw new Error("Unauthorized");
  return getAllUsers();
}

export async function upgradeUserAction(userId: string): Promise<void> {
  const user = await getUser();
  if (!user?.is_admin) throw new Error("Unauthorized");

  const res = await fetch("http://scraper:5001/admin/upgrade", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });

  if (!res.ok) throw new Error("Failed to upgrade user");
}

export async function downgradeUserAction(userId: string): Promise<void> {
  const user = await getUser();
  if (!user?.is_admin) throw new Error("Unauthorized");

  const res = await fetch("http://scraper:5001/admin/downgrade", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });

  if (!res.ok) throw new Error("Failed to downgrade user");
}

export async function deleteUserAction(userId: string): Promise<void> {
  const user = await getUser();
  if (!user?.is_admin) throw new Error("Unauthorized");
  if (user.id === userId) throw new Error("Cannot delete your own account");
  await deleteUser(userId);
}
