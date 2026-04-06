import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: { descriptor?: number[] };
  try {
    payload = (await request.json()) as { descriptor?: number[] };
  } catch {
    return NextResponse.json({ error: "Body request tidak valid" }, { status: 400 });
  }
  const descriptor = payload.descriptor;
  if (!descriptor || !Array.isArray(descriptor) || descriptor.length !== 128) {
    return NextResponse.json({ error: "Descriptor wajah tidak valid" }, { status: 400 });
  }

  const { data: profile, error: profileError } = await supabase.from("profiles").select("status").eq("id", user.id).single<{ status: "active" | "inactive" }>();
  if (profileError || !profile) {
    return NextResponse.json({ error: "Profil tidak ditemukan" }, { status: 404 });
  }
  if (profile.status !== "active") {
    return NextResponse.json({ error: "Akun tidak aktif, enroll wajah tidak diizinkan" }, { status: 403 });
  }

  const { error } = await supabase.from("profiles").update({ face_descriptor: descriptor }).eq("id", user.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Enroll wajah berhasil disimpan" });
}
