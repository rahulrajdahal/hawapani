"use client";

import React, { useEffect } from "react";
import { initPostHog } from "@/lib/analytics/posthog";

interface PostHogProviderProps {
  children: React.ReactNode;
}

export default function PostHogProvider({ children }: PostHogProviderProps) {
  useEffect(() => {
    initPostHog();
  }, []);

  return <>{children}</>;
}
