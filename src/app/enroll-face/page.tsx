"use client";

import { useState } from "react";
import { FaceCapture } from "@/components/face-capture";

export default function EnrollFacePage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function onDescriptor(descriptor: number[]) {
    setError("");
    setMessage("");

    const response = await fetch("/api/face/enroll", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ descriptor })
    });

    const payload = (await response.json()) as { message?: string; error?: string };
    if (!response.ok) {
      setError(payload.error ?? "Gagal simpan data wajah");
      return;
    }

    setMessage(payload.message ?? "Enroll berhasil");
  }

  return (
    <main className="container">
      <div className="topbar">
        <h1 className="title">Enroll Wajah</h1>
      </div>
      <FaceCapture onDescriptor={onDescriptor} buttonText="Simpan Wajah Saya" />
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
    </main>
  );
}
