import { redirect } from "next/navigation";

/**
 * Self-registration is disabled.
 * Clients are invited by the admin via /admin/users → "הזמן לקוח".
 */
export default function RegisterPage() {
  redirect("/auth/login");
}
