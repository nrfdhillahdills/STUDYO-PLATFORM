import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(request) {
  try {
    const { username, email, password, registerType } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { message: "Username, email, dan password wajib diisi." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password minimal 6 karakter." },
        { status: 400 }
      );
    }

    // Semua pendaftar masuk sebagai 'student' terlebih dahulu.
    // Jika memilih daftar sebagai Teacher, teacher_status diset 'pending' di background.
    const role = "student";
    const teacherStatus = registerType === "teacher" ? "pending" : null;

    const result = await pool.query(
      `INSERT INTO users (username, email, password, role, teacher_status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, username, email, role, teacher_status, approved_at`,
      [username.trim(), email.trim().toLowerCase(), password, role, teacherStatus]
    );

    const newUser = result.rows[0];

    const response = NextResponse.json(
      {
        message:
          registerType === "teacher"
            ? "Registrasi Teacher berhasil! Anda masuk sebagai Student sambil menunggu persetujuan Admin."
            : "Registrasi Student berhasil!",
        user: newUser,
      },
      { status: 201 }
    );

    // Set HTTP-only cookie agar langsung terautentikasi
    response.cookies.set("studyo_session", JSON.stringify({ id: newUser.id }), {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 hari
    });

    return response;
  } catch (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { message: "Email sudah terdaftar. Silakan gunakan email lain atau login." },
        { status: 409 }
      );
    }
    console.error("Register Error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}