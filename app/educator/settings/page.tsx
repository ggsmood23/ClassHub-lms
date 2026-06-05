import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { SettingsPage } from "../../components/educator/educator-management";
import { authOptions } from "@/lib/auth/options";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";

export const metadata: Metadata = {
  title: "Settings | Class Hub Educator",
};

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  await connectDB();

  const user = await User.findOne({ email: session.user.email }).select(
    "name email image",
  );

  if (!user) {
    notFound();
  }

  return (
    <SettingsPage
      user={{
        name: user.name || session.user.name || "Class Hub educator",
        email: user.email || session.user.email,
        image: user.image || session.user.image || null,
      }}
    />
  );
}
