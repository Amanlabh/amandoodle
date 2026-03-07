import { createHash } from "node:crypto"
import { cookies } from "next/headers"

const ADMIN_COOKIE_NAME = "blog_admin_session"
const DEFAULT_ADMIN_PASSWORD = "change-me"

function getAdminPassword() {
  return process.env.BLOG_ADMIN_PASSWORD ?? DEFAULT_ADMIN_PASSWORD
}

function getAdminCookieValue() {
  return createHash("sha256").update(getAdminPassword()).digest("hex")
}

export function getAdminPasswordHint() {
  if (process.env.BLOG_ADMIN_PASSWORD) {
    return "Admin password is set in BLOG_ADMIN_PASSWORD."
  }

  return "Admin password is \"change-me\". Set BLOG_ADMIN_PASSWORD in .env."
}

export async function loginAdmin(password: string) {
  if (password !== getAdminPassword()) {
    return false
  }

  const cookieStore = await cookies()
  cookieStore.set(ADMIN_COOKIE_NAME, getAdminCookieValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  })

  return true
}

export async function logoutAdmin() {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_COOKIE_NAME)
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies()
  const cookieValue = cookieStore.get(ADMIN_COOKIE_NAME)?.value
  return cookieValue === getAdminCookieValue()
}
