import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export async function requireSession() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return { supabase, user };
}

export async function requireProfile() {
  const { supabase, user } = await requireSession();
  const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single<Profile>();

  if (error || !data) {
    redirect("/signup");
  }

  return { supabase, user, profile: data };
}
