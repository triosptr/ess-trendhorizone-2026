"use client";

import { useEffect, useRef, useState } from "react";
import { FACE_MODELS_URL } from "@/lib/constants";

type FaceApiModule = typeof import("face-api.js");

interface FaceCaptureProps {
  onDescriptor: (descriptor: number[]) => Promise<void>;
  buttonText: string;
}

export function FaceCapture({ onDescriptor, buttonText }: FaceCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [faceApi, setFaceApi] = useState<FaceApiModule | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    async function init() {
      try {
        const module = await import("face-api.js");
        setFaceApi(module);
        await Promise.all([
          module.nets.tinyFaceDetector.loadFromUri(FACE_MODELS_URL),
          module.nets.faceLandmark68Net.loadFromUri(FACE_MODELS_URL),
          module.nets.faceRecognitionNet.loadFromUri(FACE_MODELS_URL)
        ]);

        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: 640, height: 480 }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        setReady(true);
      } catch (initError) {
        setError((initError as Error).message);
      }
    }

    init();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  async function capture() {
    if (!videoRef.current || !faceApi) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const detection = await faceApi
        .detectSingleFace(videoRef.current, new faceApi.TinyFaceDetectorOptions({ scoreThreshold: 0.5 }))
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setError("Wajah belum terdeteksi. Pastikan wajah berada di tengah kamera.");
        return;
      }

      await onDescriptor(Array.from(detection.descriptor));
    } catch (captureError) {
      setError((captureError as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <video ref={videoRef} style={{ width: "100%", borderRadius: 12, border: "1px solid #e5e7eb" }} muted playsInline />
      <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
        <button className="btn" type="button" onClick={capture} disabled={!ready || loading}>
          {loading ? "Memproses..." : buttonText}
        </button>
      </div>
      {error && <p className="error">{error}</p>}
      {!ready && <p className="muted">Menyiapkan kamera dan model face recognition...</p>}
    </div>
  );
}
