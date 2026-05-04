import { getUser } from "@/lib/auth/userFromToken";
import { getAllUsers } from "@/lib/repository/user/userRepository";
import { AdminPanel } from "./AdminPanel";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const user = await getUser();

  if (!user || !user.is_admin) {
    redirect("/dashboard");
  }

  const users = await getAllUsers();

  return <AdminPanel users={users} />;
}
