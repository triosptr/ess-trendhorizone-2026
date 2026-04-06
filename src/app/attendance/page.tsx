"use client";

import { useState } from "react";
import { FaceCapture } from "@/components/face-capture";
import type { AttendanceType } from "@/lib/types";

export default function AttendancePage() {
  const [checkType, setCheckType] = useState<AttendanceType>("check_in");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function onDescriptor(descriptor: number[]) {
    setError("");
    setMessage("");

    const response = await fetch("/api/attendance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ descriptor, checkType })
    });

    const payload = (await response.json()) as { message?: string; error?: string; confidenceScore?: number };
    if (!response.ok) {
      setError(payload.error ?? "Absensi gagal");
      return;
    }

    setMessage(`${payload.message ?? "Absensi berhasil"} • skor ${payload.confidenceScore?.toFixed(4) ?? "-"}`);
  }

  return (
    <main className="container">
      <div className="topbar">
        <h1 className="title">Absensi Face Recognition</h1>
      </div>
      <div className="card" style={{ marginBottom: 16 }}>
        <label className="label">Jenis Absensi</label>
        <select className="select" value={checkType} onChange={(event) => setCheckType(event.target.value as AttendanceType)}>
          <option value="check_in">Check In</option>
          <option value="check_out">Check Out</option>
        </select>
      </div>
      <FaceCapture onDescriptor={onDescriptor} buttonText="Verifikasi & Absen" />
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
    </main>
  );
}
