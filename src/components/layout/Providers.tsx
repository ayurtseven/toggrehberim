"use client";

import { ModelSecimProvider } from "@/lib/model-secim";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <ModelSecimProvider>{children}</ModelSecimProvider>;
}
