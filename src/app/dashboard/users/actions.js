"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    redirect("/dashboard");
  }
  return user;
}

export async function createUserByAdmin(formData) {
  await requireAdmin();

  const username = formData.get("username")?.trim();
  const email = formData.get("email")?.trim().toLowerCase();
  const password = formData.get("password")?.trim();
  const role = formData.get("role");

  if (!username || !email || !password || !["admin", "teacher", "student"].includes(role)) {
    redirect("/dashboard/users?error=Data pengguna tidak valid");
  }

  const teacherStatus = role === "teacher" ? "approved" : null;
  const approvedAt = role === "teacher" ? new Date() : null;

  try {
    await pool.query(
      `INSERT INTO users (username, email, password, role, teacher_status, approved_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [username, email, password, role, teacherStatus, approvedAt]
    );
  } catch (err) {
    if (err.code === "23505") {
      redirect("/dashboard/users?error=Email sudah digunakan akun lain");
    }
    throw err;
  }

  revalidatePath("/dashboard/users");
  redirect("/dashboard/users?success=Pengguna baru berhasil ditambahkan");
}

export async function approveTeacher(formData) {
  await requireAdmin();

  const userId = Number(formData.get("user_id"));
  if (!userId) return;

  // Sesuai ketentuan: role di-update menjadi 'teacher' dan mencatat waktu approved_at
  await pool.query(
    `UPDATE users
     SET role = 'teacher', teacher_status = 'approved', approved_at = NOW()
     WHERE id = $1`,
    [userId]
  );

  revalidatePath("/dashboard/users");
  revalidatePath("/profile");
  redirect("/dashboard/users?success=Akun Teacher berhasil di-approve!");
}

export async function updateUserByAdmin(formData) {
  await requireAdmin();

  const userId = Number(formData.get("user_id"));
  const username = formData.get("username")?.trim();
  const email = formData.get("email")?.trim().toLowerCase();
  const password = formData.get("password")?.trim();
  const role = formData.get("role");

  if (!userId || !username || !email || !["admin", "teacher", "student"].includes(role)) {
    redirect("/dashboard/users?error=Input edit user tidak valid");
  }

  const { rows } = await pool.query("SELECT role, approved_at FROM users WHERE id = $1", [userId]);
  if (rows.length === 0) redirect("/dashboard/users");

  const prevUser = rows[0];
  let teacherStatus = role === "teacher" ? "approved" : null;
  let approvedAt = prevUser.approved_at;

  // Jika role berubah menjadi teacher dari sebelumnya bukan teacher, catat approved_at
  if (role === "teacher" && prevUser.role !== "teacher") {
    approvedAt = new Date();
  } else if (role !== "teacher") {
    approvedAt = null;
  }

  try {
    if (password && password.length >= 6) {
      await pool.query(
        `UPDATE users
         SET username = $1, email = $2, password = $3, role = $4, teacher_status = $5, approved_at = $6
         WHERE id = $7`,
        [username, email, password, role, teacherStatus, approvedAt, userId]
      );
    } else {
      await pool.query(
        `UPDATE users
         SET username = $1, email = $2, role = $3, teacher_status = $4, approved_at = $5
         WHERE id = $6`,
        [username, email, role, teacherStatus, approvedAt, userId]
      );
    }
  } catch (err) {
    if (err.code === "23505") {
      redirect("/dashboard/users?error=Email sudah digunakan akun lain");
    }
    throw err;
  }

  revalidatePath("/dashboard/users");
  redirect("/dashboard/users?success=Data pengguna berhasil diperbarui");
}

export async function deleteUserByAdmin(formData) {
  const admin = await requireAdmin();

  const userId = Number(formData.get("user_id"));
  if (!userId || userId === admin.id) {
    redirect("/dashboard/users?error=Tidak dapat menghapus akun sendiri");
  }

  await pool.query("DELETE FROM users WHERE id = $1", [userId]);

  revalidatePath("/dashboard/users");
  redirect("/dashboard/users?success=Pengguna berhasil dihapus");
}