import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email dan password wajib diisi." },
        { status: 400 }
      );
    }

    const result = await pool.query(
      "SELECT id, username, email, role, teacher_status, approved_at FROM users WHERE email = $1 AND password = $2",
      [email.trim().toLowerCase(), password]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "Email atau password salah." },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    const response = NextResponse.json({
      message: "Login berhasil!",
      user,
    });

    response.cookies.set("studyo_session", JSON.stringify({ id: user.id }), {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}