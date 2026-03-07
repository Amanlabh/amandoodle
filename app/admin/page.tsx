import { redirect } from "next/navigation"
import { isAdminAuthenticated } from "@/lib/admin-auth"

export default async function AdminPage() {
  const isAdmin = await isAdminAuthenticated()

  if (!isAdmin) {
    redirect("/admin/login")
  }

  redirect("/admin/blog/new")
}
