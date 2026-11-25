"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

async function requireTeacherOrAdmin() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "teacher")) {
    redirect("/dashboard");
  }
  return user;
}

export async function createCourse(formData) {
  const user = await requireTeacherOrAdmin();

  const title = formData.get("title")?.trim();
  const description = formData.get("description")?.trim();
  const categoryId = Number(formData.get("category_id"));
  const startDateRaw = formData.get("start_date")?.trim();
  const endDateRaw = formData.get("end_date")?.trim();

  if (!title || !description || !categoryId) {
    redirect("/dashboard/courses?error=Nama kelas, deskripsi, dan kategori wajib diisi");
  }

  // Jika Admin yang membuat, Admin bisa memilih teacher_id dari dropdown; jika Teacher, otomatis terisi user.id
  const teacherId =
    user.role === "admin"
      ? Number(formData.get("teacher_id")) || user.id
      : user.id;

  // Rentang waktu opsional/nullable (untuk lifetime access)
  const startDate = startDateRaw ? startDateRaw : null;
  const endDate = endDateRaw ? endDateRaw : null;

  await pool.query(
    `INSERT INTO courses (title, description, category_id, teacher_id, start_date, end_date)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [title, description, categoryId, teacherId, startDate, endDate]
  );

  revalidatePath("/dashboard/courses");
  revalidatePath("/courses");
  revalidatePath("/");
  revalidatePath("/profile");
  redirect("/dashboard/courses?success=Kelas bahasa baru berhasil dibuat");
}

export async function updateCourse(formData) {
  const user = await requireTeacherOrAdmin();

  const courseId = Number(formData.get("course_id"));
  const title = formData.get("title")?.trim();
  const description = formData.get("description")?.trim();
  const categoryId = Number(formData.get("category_id"));
  const startDateRaw = formData.get("start_date")?.trim();
  const endDateRaw = formData.get("end_date")?.trim();

  if (!courseId || !title || !description || !categoryId) {
    redirect("/dashboard/courses?error=Data pembaruan kelas tidak lengkap");
  }

  // Cek kepemilikan course
  const { rows } = await pool.query("SELECT teacher_id FROM courses WHERE id = $1", [courseId]);
  if (rows.length === 0) redirect("/dashboard/courses");

  if (user.role === "teacher" && rows[0].teacher_id !== user.id) {
    redirect("/dashboard/courses?error=Anda tidak memiliki akses mengubah kelas ini");
  }

  const teacherId =
    user.role === "admin"
      ? Number(formData.get("teacher_id")) || rows[0].teacher_id
      : rows[0].teacher_id;

  const startDate = startDateRaw ? startDateRaw : null;
  const endDate = endDateRaw ? endDateRaw : null;

  await pool.query(
    `UPDATE courses
     SET title = $1, description = $2, category_id = $3, teacher_id = $4, start_date = $5, end_date = $6
     WHERE id = $7`,
    [title, description, categoryId, teacherId, startDate, endDate, courseId]
  );

  revalidatePath("/dashboard/courses");
  revalidatePath(`/courses/${courseId}`);
  revalidatePath("/courses");
  revalidatePath("/");
  redirect("/dashboard/courses?success=Data kelas berhasil diperbarui");
}

export async function deleteCourse(formData) {
  const user = await requireTeacherOrAdmin();

  const courseId = Number(formData.get("course_id"));
  if (!courseId) return;

  // Teacher hanya boleh menghapus course miliknya sendiri; Admin bebas menghapus course siapa saja
  if (user.role === "teacher") {
    await pool.query("DELETE FROM courses WHERE id = $1 AND teacher_id = $2", [
      courseId,
      user.id,
    ]);
  } else {
    await pool.query("DELETE FROM courses WHERE id = $1", [courseId]);
  }

  revalidatePath("/dashboard/courses");
  revalidatePath("/courses");
  revalidatePath("/");
  revalidatePath("/profile");
  redirect("/dashboard/courses?success=Kelas berhasil dihapus");
}