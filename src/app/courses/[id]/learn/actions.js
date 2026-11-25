"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function markContentAsDone(formData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Hanya Student yang bisa menandai selesai dan menerima sertifikat
  if (user.role !== "student") return;

  const courseId = Number(formData.get("course_id"));
  const contentId = Number(formData.get("content_id"));
  const nextContentId = formData.get("next_content_id");

  if (!courseId || !contentId) return;

  const { rows: enrollRows } = await pool.query(
    "SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2",
    [user.id, courseId]
  );
  if (enrollRows.length === 0) return;

  const enrollmentId = enrollRows[0].id;

  await pool.query(
    `INSERT INTO content_progress (enrollment_id, content_id)
     VALUES ($1, $2)
     ON CONFLICT (enrollment_id, content_id) DO NOTHING`,
    [enrollmentId, contentId]
  );

  const { rows: countRows } = await pool.query(
    `SELECT
      (SELECT COUNT(*)::int FROM contents WHERE course_id = $1) AS total_contents,
      (SELECT COUNT(*)::int FROM content_progress WHERE enrollment_id = $2) AS completed_contents`,
    [courseId, enrollmentId]
  );

  const { total_contents, completed_contents } = countRows[0];

  if (total_contents > 0 && completed_contents >= total_contents) {
    const uniqueCode = `STDY-${new Date().getFullYear()}-${crypto
      .randomBytes(4)
      .toString("hex")
      .toUpperCase()}`;

    await pool.query(
      `INSERT INTO certificates (enrollment_id, certificate_code)
       VALUES ($1, $2)
       ON CONFLICT (enrollment_id) DO NOTHING`,
      [enrollmentId, uniqueCode]
    );
  }

  revalidatePath(`/courses/${courseId}/learn`);
  revalidatePath(`/courses/${courseId}`);
  revalidatePath("/courses");
  revalidatePath("/profile");

  if (nextContentId) {
    redirect(`/courses/${courseId}/learn?content=${nextContentId}`);
  } else {
    redirect(`/courses/${courseId}/learn?content=${contentId}`);
  }
}

export async function postDiscussionComment(formData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const courseId = Number(formData.get("course_id"));
  const contentId = Number(formData.get("content_id"));
  const comment = formData.get("comment");

  if (!courseId || !contentId || !comment || comment.trim() === "") return;

  await pool.query(
    "INSERT INTO discussions (content_id, user_id, comment) VALUES ($1, $2, $3)",
    [contentId, user.id, comment.trim()]
  );

  revalidatePath(`/courses/${courseId}/learn`);
}