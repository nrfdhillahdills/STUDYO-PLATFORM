"use server";

import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function updateOwnProfile(formData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const username = formData.get("username")?.trim();
  const newPassword = formData.get("password")?.trim();
  const avatarFile = formData.get("avatar");

  if (!username) {
    redirect("/profile?error=Nama tidak boleh kosong");
  }

  let avatarUrl = user.avatar_url;

  // Proses upload gambar jika user memilih file baru
  if (avatarFile && typeof avatarFile === "object" && avatarFile.size > 0) {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(avatarFile.type)) {
      redirect("/profile?error=Format foto harus JPG, PNG, atau WebP");
    }

    if (avatarFile.size > 2 * 1024 * 1024) {
      redirect("/profile?error=Ukuran foto maksimal 2MB");
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
    await fs.mkdir(uploadDir, { recursive: true });

    const ext = path.extname(avatarFile.name) || ".png";
    const fileName = `avatar-${user.id}-${crypto.randomBytes(4).toString("hex")}${ext}`;
    const filePath = path.join(uploadDir, fileName);

    const bytes = await avatarFile.arrayBuffer();
    await fs.writeFile(filePath, Buffer.from(bytes));

    avatarUrl = `/uploads/avatars/${fileName}`;
  }

  // Update database (role tetap tidak bisa diubah sendiri oleh user)
  if (newPassword && newPassword.length >= 6) {
    await pool.query(
      "UPDATE users SET username = $1, password = $2, avatar_url = $3 WHERE id = $4",
      [username, newPassword, avatarUrl, user.id]
    );
  } else {
    await pool.query(
      "UPDATE users SET username = $1, avatar_url = $2 WHERE id = $3",
      [username, avatarUrl, user.id]
    );
  }

  revalidatePath("/profile");
  revalidatePath("/", "layout");
  redirect("/profile?success=Profil berhasil diperbarui");
}