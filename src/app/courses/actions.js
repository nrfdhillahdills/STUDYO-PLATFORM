"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function enrollCourse(formData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Hanya role 'student' yang dapat mengikuti course
  if (user.role !== "student") {
    redirect("/courses");
  }

  const courseId = Number(formData.get("course_id"));
  if (!courseId || Number.isNaN(courseId)) return;

  await pool.query(
    `INSERT INTO enrollments (student_id, course_id)
     VALUES ($1, $2)
     ON CONFLICT (student_id, course_id) DO NOTHING`,
    [user.id, courseId]
  );

  revalidatePath("/courses");
  revalidatePath(`/courses/${courseId}`);
  revalidatePath("/profile");
  revalidatePath("/");

  redirect(`/courses/${courseId}/learn`);
}