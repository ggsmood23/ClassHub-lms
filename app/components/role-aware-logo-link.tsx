"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import type { ComponentProps } from "react";

type RoleAwareLogoLinkProps = Omit<ComponentProps<typeof Link>, "href">;

function logoHrefForRole(role?: string | null) {
  if (role === "admin") {
    return "/admin";
  }

  if (role === "teacher" || role === "educator") {
    return "/educator/dashboard";
  }

  if (role === "student") {
    return "/dashboard";
  }

  return "/";
}

export function RoleAwareLogoLink(props: Readonly<RoleAwareLogoLinkProps>) {
  const { data: session, status } = useSession();
  const href =
    status === "authenticated"
      ? logoHrefForRole(session.user?.role)
      : "/";

  return <Link {...props} href={href} />;
}
