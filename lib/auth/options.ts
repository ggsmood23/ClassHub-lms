import type { NextAuthOptions } from "next-auth";
import { cookies } from "next/headers";
import { authProviders } from "./providers";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import {
  googleOAuthRoleCookie,
  readGoogleOAuthRoleCookie,
} from "@/lib/auth/oauth-role";
import { normalizeEmail } from "./validation";

type OAuthProfile = {
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
};

function normalizeRole(role?: string) {
  return role === "educator" ? "teacher" : role;
}

function roleRedirectPath(role?: string) {
  const normalizedRole = normalizeRole(role);

  if (normalizedRole === "admin") {
    return "/admin";
  }

  if (normalizedRole === "teacher") {
    return "/educator/dashboard";
  }

  return "/dashboard";
}

async function syncOAuthUser({
  user,
  profile,
  provider,
}: {
  user: { id?: string; name?: string | null; email?: string | null; image?: string | null; role?: string };
  profile?: OAuthProfile;
  provider?: string;
}) {
  const email = normalizeEmail(profile?.email ?? user.email ?? "");

  if (!email) {
    return false;
  }

  if (profile?.email_verified === false) {
    return false;
  }

  await connectDB();

  const profileImage = profile?.picture ?? user.image ?? undefined;
  const displayName =
    profile?.name?.trim() || user.name?.trim() || email.split("@")[0] || "Class Hub learner";

  let dbUser = await User.findOne({ email });

  if (dbUser) {
    dbUser.emailVerified = true;
    dbUser.verificationToken = undefined;
    dbUser.verificationTokenExpires = undefined;

    if (displayName && dbUser.name !== displayName) {
      dbUser.name = displayName;
    }

    if (profileImage && dbUser.image !== profileImage) {
      dbUser.image = profileImage;
    }

    await dbUser.save();
  } else {
    const selectedRole =
      provider === "google" ? await getSelectedGoogleOAuthRole() : "student";

    try {
      dbUser = await User.create({
        name: displayName,
        email,
        emailVerified: true,
        image: profileImage,
        role: selectedRole,
      });
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === 11000
      ) {
        dbUser = await User.findOne({ email });
      } else {
        throw error;
      }
    }
  }

  if (!dbUser) {
    return false;
  }

  user.id = dbUser._id.toString();
  user.name = dbUser.name;
  user.email = dbUser.email;
  user.image = dbUser.image;
  user.role = dbUser.role;

  return true;
}

async function getSelectedGoogleOAuthRole() {
  const cookieStore = await cookies();
  const selectedRole = readGoogleOAuthRoleCookie(
    cookieStore.get(googleOAuthRoleCookie)?.value,
  );

  try {
    cookieStore.delete(googleOAuthRoleCookie);
  } catch {
    // Cookie deletion is best-effort here; the role cookie is signed and short-lived.
  }

  return selectedRole;
}

export const authOptions: NextAuthOptions = {
  providers: authProviders,
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.type !== "oauth") {
        return true;
      }

      return syncOAuthUser({
        user,
        profile: profile as OAuthProfile | undefined,
        provider: account.provider,
      });
    },
    async redirect({ baseUrl, url }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      if (new URL(url).origin === baseUrl) {
        return url;
      }

      return `${baseUrl}/dashboard`;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.picture = user.image;
      }

      if (token.email) {
        await connectDB();

        const dbUser = await User.findOne({ email: normalizeEmail(token.email) }).select(
          "_id name email role image",
        );

        if (dbUser) {
          token.id = dbUser._id.toString();
          token.name = dbUser.name;
          token.email = dbUser.email;
          token.role = dbUser.role;
          token.picture = dbUser.image;
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: typeof token.id === "string" ? token.id : token.sub,
        name: token.name ?? null,
        email: token.email ?? null,
        image: typeof token.picture === "string" ? token.picture : null,
        role: typeof token.role === "string" ? token.role : undefined,
      };

      return session;
    },
  },
};

export { normalizeRole, roleRedirectPath };
