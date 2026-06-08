import AppleProvider from "next-auth/providers/apple";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";
import { scryptSync, timingSafeEqual } from "crypto";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import {
  createVerificationToken,
  sendVerificationEmail,
} from "./email-verification";
import { isValidEmail, normalizeEmail, validatePassword } from "./validation";

function isConfigured(...values: Array<string | undefined>) {
  return values.every((value) => Boolean(value?.trim()));
}

function hashPassword(password: string, email: string) {
  return scryptSync(password, email.toLowerCase(), 64).toString("hex");
}

function passwordsMatch(password: string, email: string, passwordHash: string) {
  const expected = Buffer.from(passwordHash, "hex");
  const actual = Buffer.from(hashPassword(password, email), "hex");

  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

const roleLabels = {
  admin: "Admin",
  student: "Student",
  teacher: "Educator",
} as const;

type AuthRole = keyof typeof roleLabels;

function parseRole(role: string | undefined): AuthRole | null {
  if (role === "admin" || role === "student" || role === "teacher") {
    return role;
  }

  return null;
}

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "Email",
    credentials: {
      name: { label: "Name", type: "text" },
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
      mode: { label: "Mode", type: "text" },
      role: { label: "Role", type: "text" },
    },
    async authorize(credentials) {
      const email = normalizeEmail(credentials?.email ?? "");
      const password = credentials?.password ?? "";
      const name = credentials?.name?.trim();
      const mode = credentials?.mode === "signup" ? "signup" : "login";
      const selectedRole = parseRole(credentials?.role);

      if (!isValidEmail(email) || !selectedRole) {
        return null;
      }

      if (mode === "signup" && !validatePassword(password).isValid) {
        return null;
      }

      if (mode === "login" && !password) {
        return null;
      }

      await connectDB();

      const existingUser = await User.findOne({ email }).select(
        "+passwordHash +verificationToken +verificationTokenExpires",
      );

      if (mode === "signup") {
        if (selectedRole === "admin") {
          return null;
        }

        if (existingUser) {
          throw new Error(
            "An account with this email already exists. Please sign in instead.",
          );
        }

        const verification = createVerificationToken();
        const signedInUser = await User.create({
          name: name || email.split("@")[0] || "Class Hub learner",
          email,
          emailVerified: false,
          verificationToken: verification.hash,
          verificationTokenExpires: verification.expires,
          passwordHash: hashPassword(password, email),
          image: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
            name || email,
          )}`,
          role: selectedRole,
        });

        try {
          await sendVerificationEmail({
            email: signedInUser.email,
            name: signedInUser.name,
            token: verification.token,
          });
        } catch {
          throw new Error(
            "Account created, but the verification email could not be sent. Please resend verification.",
          );
        }

        throw new Error("Please verify your email before logging in.");
      }

      if (!existingUser?.passwordHash) {
        return null;
      }

      if (existingUser.accountStatus === "suspended") {
        throw new Error("This account is suspended. Contact an administrator for help.");
      }

      if (!passwordsMatch(password, email, existingUser.passwordHash)) {
        return null;
      }

      if (existingUser.role !== selectedRole) {
        throw new Error(
          `You are registered as a ${roleLabels[existingUser.role as AuthRole] ?? "different role"}. Please select the correct role.`,
        );
      }

      if (existingUser.emailVerified !== true) {
        throw new Error("Please verify your email before logging in.");
      }

      return {
        id: existingUser._id.toString(),
        name: existingUser.name,
        email: existingUser.email,
        image: existingUser.image,
        role: existingUser.role,
      };
    },
  }),
];

if (isConfigured(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET)) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  );
}

if (isConfigured(process.env.GITHUB_CLIENT_ID, process.env.GITHUB_CLIENT_SECRET)) {
  providers.push(
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  );
}

if (isConfigured(process.env.APPLE_CLIENT_ID, process.env.APPLE_CLIENT_SECRET)) {
  providers.push(
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
    }),
  );
}

export const authProviders = providers;
