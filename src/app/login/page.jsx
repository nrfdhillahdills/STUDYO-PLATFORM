"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Gagal masuk.");
        setLoading(false);
        return;
      }

      if (data.user.role === "admin" || data.user.role === "teacher") {
        router.push("/dashboard");
      } else {
        router.push("/profile");
      }
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
            Selamat Datang Kembali
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#182338]">
            Masuk ke Studyo
          </h1>
          <p className="text-sm text-[#5A657A] mt-1.5">
            Lanjutkan kelas bahasa dan pantau progres belajarmu.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[#FAF8F2] border-2 border-[#E6E0D2] rounded-2xl px-4 py-3 text-sm text-[#182338] focus:outline-none focus:border-[#182338] transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#182338] hover:bg-[#243454] disabled:opacity-60 text-[#FBE48B] font-extrabold text-sm py-3.5 rounded-full shadow-[0_10px_20px_-6px_rgba(24,35,56,0.35),inset_0_3px_6px_rgba(255,255,255,0.14)] transition cursor-pointer mt-2"
          >
            {loading ? "Memverifikasi Akun..." : "Masuk Sekarang"}
          </button>
        </form>

        <p className="text-center text-sm text-[#5A657A] mt-6">
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="text-[#182338] font-extrabold underline decoration-[#FBE48B] decoration-2 underline-offset-4 hover:text-[#2B3D60]"
          >
            Daftar gratis
          </Link>
        </p>
      </div>
    </div>
  );
}