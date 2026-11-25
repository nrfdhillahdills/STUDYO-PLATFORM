"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

async function verifyCourseOwnerOrAdmin(courseId) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "teacher")) {
    redirect("/dashboard");
  }

  const { rows } = await pool.query("SELECT teacher_id FROM courses WHERE id = $1", [courseId]);
  if (rows.length === 0) redirect("/dashboard/courses");

  if (user.role === "teacher" && rows[0].teacher_id !== user.id) {
    redirect("/dashboard/courses?error=Anda hanya boleh mengelola materi di kelas Anda sendiri");
  }
  return user;
}

export async function createContent(formData) {
  const courseId = Number(formData.get("course_id"));
  await verifyCourseOwnerOrAdmin(courseId);

  const title = formData.get("title")?.trim();
  const body = formData.get("body")?.trim();
  const orderIndex = Number(formData.get("order_index"));

  if (!title || !body || Number.isNaN(orderIndex)) {
    redirect(`/dashboard/courses/${courseId}/contents?error=Judul, urutan, dan isi materi wajib diisi`);
  }

  await pool.query(
    "INSERT INTO contents (course_id, title, body, order_index) VALUES ($1, $2, $3, $4)",
    [courseId, title, body, orderIndex]
  );

  revalidatePath(`/dashboard/courses/${courseId}/contents`);
  revalidatePath(`/courses/${courseId}`);
  revalidatePath(`/courses/${courseId}/learn`);
  redirect(`/dashboard/courses/${courseId}/contents?success=Materi baru berhasil ditambahkan`);
}

export async function updateContent(formData) {
  const courseId = Number(formData.get("course_id"));
  const contentId = Number(formData.get("content_id"));
  await verifyCourseOwnerOrAdmin(courseId);

  const title = formData.get("title")?.trim();
  const body = formData.get("body")?.trim();
  const orderIndex = Number(formData.get("order_index"));

  if (!contentId || !title || !body || Number.isNaN(orderIndex)) {
    redirect(`/dashboard/courses/${courseId}/contents?error=Data edit materi tidak lengkap`);
  }

  await pool.query(
    "UPDATE contents SET title = $1, body = $2, order_index = $3 WHERE id = $4 AND course_id = $5",
    [title, body, orderIndex, contentId, courseId]
  );

  revalidatePath(`/dashboard/courses/${courseId}/contents`);
  revalidatePath(`/courses/${courseId}`);
  revalidatePath(`/courses/${courseId}/learn`);
  redirect(`/dashboard/courses/${courseId}/contents?success=Materi berhasil diperbarui`);
}

export async function deleteContent(formData) {
  const courseId = Number(formData.get("course_id"));
  const contentId = Number(formData.get("content_id"));
  await verifyCourseOwnerOrAdmin(courseId);

  if (!contentId) return;

  await pool.query("DELETE FROM contents WHERE id = $1 AND course_id = $2", [
    contentId,
    courseId,
  ]);

  revalidatePath(`/dashboard/courses/${courseId}/contents`);
  revalidatePath(`/courses/${courseId}`);
  revalidatePath(`/courses/${courseId}/learn`);
  redirect(`/dashboard/courses/${courseId}/contents?success=Materi berhasil dihapus`);
}