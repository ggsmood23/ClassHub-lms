import type { Metadata } from "next";
import { AuthSessionProvider } from "./components/auth-session-provider";
import { ToastProvider } from "./components/toast-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Class Hub | Modern LMS Platform",
  description:
    "Class Hub is a modern learning management homepage for courses, cohorts, and student outcomes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AuthSessionProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
