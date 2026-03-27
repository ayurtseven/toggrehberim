import { Suspense } from "react";
import GirisIstemci from "./GirisIstemci";

export default function GirisPage() {
  return (
    <Suspense>
      <GirisIstemci />
    </Suspense>
  );
}
