import type { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { getAdminUsers } from "@/lib/admin";
import { authOptions } from "@/lib/auth/options";
import { UsersAdminPage } from "../../components/admin/admin-pages";

export const metadata: Metadata = {
  title: "Teachers | Class Hub Admin",
};

export default async function Page() {
  const [session, users] = await Promise.all([
    getServerSession(authOptions),
    getAdminUsers("teacher"),
  ]);

  return (
    <UsersAdminPage
      currentAdminId={session?.user?.id || ""}
      title="Manage teachers"
      users={users}
    />
  );
}
