import type { Metadata } from "next";
import { AuthForm } from "../../components/auth-form";

export const metadata: Metadata = {
  title: "Login | Class Hub",
  description: "Sign in to your Class Hub learning dashboard.",
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
