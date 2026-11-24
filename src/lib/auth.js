import { cookies } from "next/headers";
import pool from "@/lib/db";

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("studyo_session");

    if (!sessionCookie || !sessionCookie.value) {
      return null;
    }

    const sessionData = JSON.parse(sessionCookie.value);

    const { rows } = await pool.query(
      "SELECT id, username, email, role, teacher_status, approved_at, avatar_url, created_at FROM users WHERE id = $1",
      [sessionData.id]
    );

    if (rows.length === 0) return null;
    return rows[0];
  } catch (error) {
    return null;
  }
}