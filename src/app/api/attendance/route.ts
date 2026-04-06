import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { FACE_DISTANCE_THRESHOLD } from "@/lib/constants";
import { euclideanDistance } from "@/lib/face";
import type { AttendanceType, Profile } from "@/lib/types";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: { descriptor?: number[]; checkType?: AttendanceType };
  try {
    payload = (await request.json()) as { descriptor?: number[]; checkType?: AttendanceType };
  } catch {
    return NextResponse.json({ error: "Body request tidak valid" }, { status: 400 });
  }
  const descriptor = payload.descriptor;
  const checkType = payload.checkType;

  if (!descriptor || !Array.isArray(descriptor) || descriptor.length !== 128) {
    return NextResponse.json({ error: "Descriptor wajah tidak valid" }, { status: 400 });
  }

  if (checkType !== "check_in" && checkType !== "check_out") {
    return NextResponse.json({ error: "Tipe absensi tidak valid" }, { status: 400 });
  }

  const { data: profile, error: profileError } = await supabase.from("profiles").select("*").eq("id", user.id).single<Profile>();
  if (profileError || !profile) {
    return NextResponse.json({ error: "Profil tidak ditemukan" }, { status: 404 });
  }
  if (profile.status !== "active") {
    return NextResponse.json({ error: "Akun tidak aktif, absensi tidak diizinkan" }, { status: 403 });
  }

  if (!Array.isArray(profile.face_descriptor)) {
    return NextResponse.json({ error: "Wajah belum di-enroll. Silakan enroll wajah dulu." }, { status: 400 });
  }

  const { data: lastAttendance } = await supabase
    .from("attendance_logs")
    .select("captured_at")
    .eq("user_id", user.id)
    .eq("check_type", checkType)
    .order("captured_at", { ascending: false })
    .limit(1)
    .maybeSingle<{ captured_at: string }>();

  if (lastAttendance) {
    const nowMs = Date.now();
    const lastMs = new Date(lastAttendance.captured_at).getTime();
    if (nowMs - lastMs < 60_000) {
      return NextResponse.json({ error: "Absensi terlalu cepat. Coba lagi dalam 1 menit." }, { status: 429 });
    }
  }

  const distance = euclideanDistance(descriptor, profile.face_descriptor);
  if (distance > FACE_DISTANCE_THRESHOLD) {
    return NextResponse.json({ error: "Verifikasi wajah gagal. Coba ulangi di posisi yang lebih terang.", confidenceScore: distance }, { status: 401 });
  }

  const { error: attendanceError } = await supabase.from("attendance_logs").insert({
    user_id: user.id,
    check_type: checkType,
    captured_at: new Date().toISOString(),
    confidence_score: distance
  });

  if (attendanceError) {
    return NextResponse.json({ error: attendanceError.message }, { status: 500 });
  }

  return NextResponse.json({
    message: checkType === "check_in" ? "Check in berhasil" : "Check out berhasil",
    confidenceScore: distance
  });
}
