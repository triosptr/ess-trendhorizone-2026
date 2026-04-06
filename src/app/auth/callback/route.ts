import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const requestedNext = url.searchParams.get("next") ?? "/dashboard";
  const safeNext = requestedNext.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/dashboard";

  const error = url.searchParams.get("error") ?? url.searchParams.get("error_code");
  const errorDescription = url.searchParams.get("error_description");

  if (error || errorDescription) {
    const params = new URLSearchParams();
    if (error) params.set("error", error);
    if (errorDescription) params.set("error_description", errorDescription);
    return NextResponse.redirect(new URL(`/login?${params.toString()}`, url.origin));
  }

  const supabase = await createClient();
  if (code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) {
      const params = new URLSearchParams();
      params.set("error", "auth_exchange_failed");
      params.set("error_description", exchangeError.message);
      return NextResponse.redirect(new URL(`/login?${params.toString()}`, url.origin));
    }
    return NextResponse.redirect(new URL(safeNext, url.origin));
  }

  if (tokenHash && type) {
    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as "signup" | "email_change" | "recovery" | "invite" | "email"
    });
    if (verifyError) {
      const params = new URLSearchParams();
      params.set("error", "otp_verify_failed");
      params.set("error_description", verifyError.message);
      return NextResponse.redirect(new URL(`/login?${params.toString()}`, url.origin));
    }
    return NextResponse.redirect(new URL(safeNext, url.origin));
  }

  return NextResponse.redirect(new URL("/login?error=missing_code", url.origin));
}
