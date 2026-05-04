import { getUser } from "@/lib/auth/userFromToken";
import { PageContent } from "./Content";

export default async function ConfirmEmailPendingPage() {
  const user = await getUser();
  return <PageContent userEmail={user ? user.email : null} />;
}
