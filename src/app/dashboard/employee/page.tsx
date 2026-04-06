import { requireProfile } from "@/lib/auth";
import type { AttendanceLog } from "@/lib/types";

export default async function EmployeeDashboardPage() {
  const { supabase, user, profile } = await requireProfile();
  const { data } = await supabase.from("attendance_logs").select("*").eq("user_id", user.id).order("captured_at", { ascending: false }).limit(20);
  const logs = (data as AttendanceLog[] | null) ?? [];
  const checkInCount = logs.filter((item) => item.check_type === "check_in").length;
  const checkOutCount = logs.filter((item) => item.check_type === "check_out").length;

  return (
    <section className="grid" style={{ gap: 20 }}>
      <div className="grid grid-2">
        <div className="card">
          <p className="muted">Nama</p>
          <p className="stat" style={{ fontSize: 22 }}>
            {profile.full_name}
          </p>
        </div>
        <div className="card">
          <p className="muted">NIK</p>
          <p className="stat" style={{ fontSize: 22 }}>
            {profile.employee_id}
          </p>
        </div>
        <div className="card">
          <p className="muted">Check In (20 log terakhir)</p>
          <p className="stat">{checkInCount}</p>
        </div>
        <div className="card">
          <p className="muted">Check Out (20 log terakhir)</p>
          <p className="stat">{checkOutCount}</p>
        </div>
      </div>

      <div className="card">
        <h2>Riwayat Absensi</h2>
        <div className="list">
          {logs.map((log) => (
            <div className="list-item" key={log.id}>
              <strong>{log.check_type === "check_in" ? "Check In" : "Check Out"}</strong>
              <p className="muted" style={{ margin: "4px 0 0" }}>
                {new Date(log.captured_at).toLocaleString("id-ID")} • Score: {log.confidence_score.toFixed(4)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
