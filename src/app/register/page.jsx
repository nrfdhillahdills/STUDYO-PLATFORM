"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [registerType, setRegisterType] = useState("student"); // 'student' | 'teacher'
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, registerType }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Gagal mendaftar.");
        setLoading(false);
        return;
      }

      // Sesuai ketentuan: semua pendaftar masuk sebagai Student terlebih dahulu
      router.push("/profile");
      router.refresh();
    } catch (err) {
      setError("Terjadi gangguan jaringan.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md clay-card p-8 sm:p-9">
        <div className="text-center mb-6">
          <span className="inline-block bg-[#FBE48B] text-[#182338] text-xs font-extrabold px-3.5 py-1 rounded-full mb-3">
            Bergabung dengan Studyo
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#182338]">
            Buat Akun Baru
          </h1>
          <p className="text-sm text-[#5A657A] mt-1.5">
            Pilih jalur pendaftaran sesuai peran belajarmu.
          </p>
        </div>

        {/* Dua Pilihan Registrasi: Student vs Teacher (3D Clay Switcher) */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#182338] rounded-full mb-6 shadow-[inset_0_3px_6px_rgba(9,14,24,0.6)]">
          <button
            type="button"
            onClick={() => setRegisterType("student")}
            className={`py-2.5 text-xs sm:text-sm font-extrabold rounded-full transition cursor-pointer ${
              registerType === "student"
                ? "clay-yellow text-[#182338]"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Register as Student
          </button>
          <button
            type="button"
            onClick={() => setRegisterType("teacher")}
            className={`py-2.5 text-xs sm:text-sm font-extrabold rounded-full transition cursor-pointer ${
              registerType === "teacher"
                ? "clay-yellow text-[#182338]"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Register as Teacher
          </button>
        </div>

        {registerType === "teacher" && (
          <div className="mb-5 p-4 rounded-2xl bg-[#FFF8DC] border-2 border-[#FBE48B] text-xs text-[#182338] leading-relaxed">
            <strong>Info Pengajar:</strong> Setelah mendaftar, kamu akan masuk ke sistem sebagai{" "}
            <span className="font-bold underline">Student</span> terlebih dahulu sementara status pengajarmu berada di background sebagai{" "}
            <span className="font-extrabold">Pending</span> hingga diverifikasi Admin.
          </div>
        )}

        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wide text-[#182338] mb-1.5">
              Nama Lengkap / Username
            </label>
            <input
              type="text"
              placeholder="Contoh: Dillah Fauziah"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full bg-[#FAF8F2] border-2 border-[#E6E0D2] rounded-2xl px-4 py-3 text-sm text-[#182338] focus:outline-none focus:border-[#182338] transition"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wide text-[#182338] mb-1.5">
              Alamat Email
            </label>
            <input
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#FAF8F2] border-2 border-[#E6E0D2] rounded-2xl px-4 py-3 text-sm text-[#182338] focus:outline-none focus:border-[#182338] transition"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wide text-[#182338] mb-1.5">
              Password
            </label>
            <input
              type="password"
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-[#FAF8F2] border-2 border-[#E6E0D2] rounded-2xl px-4 py-3 text-sm text-[#182338] focus:outline-none focus:border-[#182338] transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#182338] hover:bg-[#243454] disabled:opacity-60 text-[#FBE48B] font-extrabold text-sm py-3.5 rounded-full shadow-[0_10px_20px_-6px_rgba(24,35,56,0.35),inset_0_3px_6px_rgba(255,255,255,0.14)] transition cursor-pointer mt-2"
          >
            {loading
              ? "Memproses Pendaftaran..."
              : registerType === "teacher"
              ? "Daftar sebagai Teacher"
              : "Daftar sebagai Student"}
          </button>
        </form>

        <p className="text-center text-sm text-[#5A657A] mt-6">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="text-[#182338] font-extrabold underline decoration-[#FBE48B] decoration-2 underline-offset-4 hover:text-[#2B3D60]"
          >
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}