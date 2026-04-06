import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import type { AttendanceLog, Profile } from "@/lib/types";

export default async function AdminDashboardPage() {
  const { supabase, profile } = await requireProfile();

  if (profile.role !== "superadmin") {
    redirect("/dashboard/employee");
  }

  const [profilesRes, attendanceRes] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("attendance_logs").select("*").order("captured_at", { ascending: false }).limit(10)
  ]);

  const profiles = (profilesRes.data as Profile[] | null) ?? [];
  const logs = (attendanceRes.data as AttendanceLog[] | null) ?? [];
  const employeeCount = profiles.filter((item) => item.role === "employee").length;
  const activeCount = profiles.filter((item) => item.status === "active").length;
  const enrolledFaceCount = profiles.filter((item) => Array.isArray(item.face_descriptor)).length;

  return (
    <section className="grid" style={{ gap: 20 }}>
      <div className="grid grid-2">
        <div className="card">
          <p className="muted">Total Karyawan</p>
          <p className="stat">{employeeCount}</p>
        </div>
        <div className="card">
          <p className="muted">Karyawan Aktif</p>
          <p className="stat">{activeCount}</p>
        </div>
        <div className="card">
          <p className="muted">Wajah Terdaftar</p>
          <p className="stat">{enrolledFaceCount}</p>
        </div>
        <div className="card">
          <p className="muted">Log Absensi Terbaru</p>
          <p className="stat">{logs.length}</p>
        </div>
      </div>

      <div className="card">
        <h2>Daftar Karyawan</h2>
        <div className="list">
          {profiles
            .filter((item) => item.role === "employee")
            .map((item) => (
              <div className="list-item" key={item.id}>
                <strong>{item.full_name}</strong>
                <p className="muted" style={{ margin: "4px 0 0" }}>
                  {item.employee_id} • {item.department} • {item.position} • {item.status}
                </p>
              </div>
            ))}
        </div>
      </div>

      <div className="card">
        <h2>Aktivitas Absensi Terakhir</h2>
        <div className="list">
          {logs.map((log) => (
            <div className="list-item" key={log.id}>
              <strong>{log.check_type === "check_in" ? "Check In" : "Check Out"}</strong>
              <p className="muted" style={{ margin: "4px 0 0" }}>
                User: {log.user_id} • Score: {log.confidence_score.toFixed(4)} • {new Date(log.captured_at).toLocaleString("id-ID")}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
