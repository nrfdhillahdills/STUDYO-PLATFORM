import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import LogoutButton from "./LogoutButton";

export default async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 px-4 pt-3">
      <nav className="max-w-6xl mx-auto clay-navy px-5 sm:px-7 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand Logo Studyo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="w-9 h-9 rounded-2xl bg-[#FBE48B] text-[#182338] flex items-center justify-center font-black text-lg shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),inset_0_-3px_5px_rgba(180,140,20,0.3)] group-hover:scale-105 transition">
            S
          </span>
          <span className="text-xl font-extrabold tracking-tight text-white">
            Stud<span className="text-[#FBE48B]">yo</span>
          </span>
        </Link>

        {/* Link Navigasi Utama */}
        <div className="flex items-center gap-4 sm:gap-6 text-sm font-semibold">
          <Link
            href="/"
            className="text-slate-200 hover:text-[#FBE48B] transition"
          >
            Beranda
          </Link>
          <Link
            href="/courses"
            className="text-slate-200 hover:text-[#FBE48B] transition"
          >
            Katalog Bahasa
          </Link>

          {user && (
            <Link
              href="/profile"
              className="text-slate-200 hover:text-[#FBE48B] transition"
            >
              Profil Saya
            </Link>
          )}

          {user && (user.role === "admin" || user.role === "teacher") && (
            <Link
              href="/dashboard"
              className="text-[#FBE48B] hover:underline transition"
            >
              CMS Dashboard
            </Link>
          )}
        </div>

        {/* Tombol Auth / Info Akun dengan Avatar */}
        <div className="flex items-center gap-2.5">
          {!user ? (
            <>
              <Link
                href="/login"
                className="px-4 py-2 rounded-full text-xs sm:text-sm font-bold text-white hover:text-[#FBE48B] transition"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="clay-yellow px-4 sm:px-5 py-2 text-xs sm:text-sm font-extrabold"
              >
                Daftar Gratis
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className="hidden sm:flex items-center gap-2 bg-[#233250] hover:bg-[#2B3D61] px-3 py-1.5 rounded-full border border-[#344973] transition"
              >
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.username}
                    className="w-6 h-6 rounded-full object-cover border border-[#FBE48B]"
                  />
                ) : (
                  <span className="w-6 h-6 rounded-full bg-[#FBE48B] text-[#182338] flex items-center justify-center text-[11px] font-black">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="text-xs font-bold text-white">
                  {user.username}
                </span>
                <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-[#FBE48B] text-[#182338] font-extrabold">
                  {user.role}
                </span>
              </Link>
              <LogoutButton />
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}