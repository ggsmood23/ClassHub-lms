import type { Metadata } from "next";
import { AuthForm } from "../../components/auth-form";

export const metadata: Metadata = {
  title: "Sign Up | Class Hub",
  description: "Create your Class Hub account and start learning.",
};

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
