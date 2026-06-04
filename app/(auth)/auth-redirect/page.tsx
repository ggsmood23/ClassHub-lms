import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions, roleRedirectPath } from "@/lib/auth/options";

export default async function AuthRedirectPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  redirect(roleRedirectPath(session.user.role));
}
