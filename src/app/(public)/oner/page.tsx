import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import OneriFormu from "./OneriFormu";

export default async function OnerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/giris?next=/oner");
  return <OneriFormu />;
}
