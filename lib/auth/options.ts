import type { NextAuthOptions } from "next-auth";
import { authProviders } from "./providers";

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
