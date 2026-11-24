"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/dashboard");
}

export async function createCategory(formData) {
  await requireAdmin();
  const name = formData.get("name")?.trim();
  if (!name) return;

  try {
    await pool.query("INSERT INTO categories (name) VALUES ($1)", [name]);
  } catch (err) {
    if (err.code === "23505") {
      redirect("/dashboard/categories?error=Nama kategori sudah ada");
    }
    throw err;
  }

  revalidatePath("/dashboard/categories");
  revalidatePath("/dashboard/courses");
  revalidatePath("/");
  revalidatePath("/courses");
  redirect("/dashboard/categories?success=Kategori bahasa berhasil ditambahkan");
}

export async function updateCategory(formData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const name = formData.get("name")?.trim();
  if (!id || !name) return;

  try {
    await pool.query("UPDATE categories SET name = $1 WHERE id = $2", [name, id]);
  } catch (err) {
    if (err.code === "23505") {
      redirect("/dashboard/categories?error=Nama kategori sudah ada");
    }
    throw err;
  }

  revalidatePath("/dashboard/categories");
  revalidatePath("/dashboard/courses");
  revalidatePath("/");
  revalidatePath("/courses");
  redirect("/dashboard/categories?success=Kategori berhasil diperbarui");
}

export async function deleteCategory(formData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!id) return;

  await pool.query("DELETE FROM categories WHERE id = $1", [id]);

  revalidatePath("/dashboard/categories");
  revalidatePath("/dashboard/courses");
  revalidatePath("/");
  revalidatePath("/courses");
  redirect("/dashboard/categories?success=Kategori berhasil dihapus");
}