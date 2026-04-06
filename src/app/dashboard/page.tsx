import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";

export default async function DashboardRedirectPage() {
  const { profile } = await requireProfile();

  if (profile.role === "superadmin") {
    redirect("/dashboard/admin");
  }

  redirect("/dashboard/employee");
}
