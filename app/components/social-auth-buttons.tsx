"use client";

import { getProviders, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { useToast } from "./toast-provider";

type SocialProvider = {
  id: "google" | "github" | "apple";
  label: string;
};

const supportedSocialProviders: SocialProvider[] = [
  { id: "google", label: "Continue with Google" },
  { id: "github", label: "Continue with GitHub" },
  { id: "apple", label: "Continue with Apple" },
];

export function SocialAuthButtons({
  onProviderCountChange,
}: Readonly<{ onProviderCountChange?: (count: number) => void }>) {
  const [socialProviders, setSocialProviders] = useState<SocialProvider[]>([]);
  const [loadingProvider, setLoadingProvider] = useState<SocialProvider["id"] | null>(
    null,
  );
  const { showToast } = useToast();

  useEffect(() => {
    let isMounted = true;

    getProviders().then((providers) => {
      if (!isMounted) {
        return;
      }

      const configuredProviders = supportedSocialProviders.filter(
        (provider) => providers?.[provider.id]?.type === "oauth",
      );

      setSocialProviders(configuredProviders);
      onProviderCountChange?.(configuredProviders.length);
    });

    return () => {
      isMounted = false;
    };
  }, [onProviderCountChange]);

  async function continueWithProvider(provider: SocialProvider["id"]) {
    setLoadingProvider(provider);
    showToast({
      title: "Opening secure sign-in",
      message: `Redirecting to ${providerLabel(provider)}.`,
      variant: "info",
    });

    await signIn(provider, { callbackUrl: "/dashboard" });
    setLoadingProvider(null);
  }

  if (socialProviders.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {socialProviders.map((provider) => (
        <button
          key={provider.id}
          onClick={() => continueWithProvider(provider.id)}
          disabled={loadingProvider !== null}
          className="group flex h-13 w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white/78 px-4 text-sm font-black text-slate-800 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-xl hover:shadow-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:border-cyan-300/40"
          type="button"
        >
          <ProviderIcon provider={provider.id} />
          <span>
            {loadingProvider === provider.id ? "Connecting..." : provider.label}
          </span>
        </button>
      ))}
    </div>
  );
}

function providerLabel(provider: SocialProvider["id"]) {
  return provider === "google"
    ? "Google"
    : provider === "github"
      ? "GitHub"
      : "Apple";
}

function ProviderIcon({ provider }: Readonly<{ provider: SocialProvider["id"] }>) {
  if (provider === "google") {
    return (
      <svg className="size-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M21.8 12.2c0-.7-.1-1.3-.2-1.9H12v3.6h5.5a4.7 4.7 0 0 1-2 3.1v2.6h3.2c1.9-1.8 3.1-4.3 3.1-7.4Z"
        />
        <path
          fill="#34A853"
          d="M12 22c2.7 0 5-.9 6.7-2.4L15.5 17c-.9.6-2 .9-3.5.9a6 6 0 0 1-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Z"
        />
        <path
          fill="#FBBC05"
          d="M6.4 13.8a6 6 0 0 1 0-3.6V7.6H3.1a10 10 0 0 0 0 8.8l3.3-2.6Z"
        />
        <path
          fill="#EA4335"
          d="M12 6.1c1.5 0 2.8.5 3.8 1.5l2.9-2.9A9.7 9.7 0 0 0 12 2a10 10 0 0 0-8.9 5.6l3.3 2.6A6 6 0 0 1 12 6.1Z"
        />
      </svg>
    );
  }

  if (provider === "github") {
    return (
      <svg
        className="size-5 shrink-0 fill-slate-950 dark:fill-white"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.2-3.4-1.2-.5-1.1-1.1-1.4-1.1-1.4-.9-.7.1-.7.1-.7 1 0 1.6 1.1 1.6 1.1.9 1.6 2.4 1.1 2.9.9.1-.7.4-1.1.7-1.4-2.2-.3-4.6-1.1-4.6-4.9 0-1.1.4-2 1.1-2.7-.1-.3-.5-1.3.1-2.7 0 0 .9-.3 2.8 1a9.7 9.7 0 0 1 5.2 0c2-1.3 2.8-1 2.8-1 .6 1.4.2 2.4.1 2.7.7.7 1.1 1.6 1.1 2.7 0 3.8-2.3 4.6-4.6 4.9.4.3.8 1 .8 2.1V21c0 .3.2.6.8.5A10 10 0 0 0 12 2Z" />
      </svg>
    );
  }

  return (
    <svg
      className="size-5 shrink-0 fill-slate-950 dark:fill-white"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M16.6 12.5c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3-1.7-1.3-.1-2.5.8-3.2.8s-1.7-.8-2.8-.8c-1.4 0-2.8.8-3.5 2.1-1.5 2.6-.4 6.5 1.1 8.6.7 1 1.6 2.2 2.7 2.1 1.1 0 1.5-.7 2.8-.7s1.7.7 2.9.7 2-1.1 2.7-2.1c.8-1.2 1.2-2.4 1.2-2.5 0 0-2.7-1-2.7-3.3ZM14.5 6.2c.6-.7 1-1.7.9-2.6-.9 0-1.9.6-2.5 1.3-.6.6-1 1.6-.9 2.5.9.1 1.9-.5 2.5-1.2Z" />
    </svg>
  );
}
