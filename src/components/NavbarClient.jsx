"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function NavbarClient({ user }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    setMenuOpen(false);
    router.push("/login");
    router.refresh();
  }

  const navLinks = [
    { label: "Beranda", href: "/" },
    { label: "Katalog Bahasa", href: "/courses" },
    ...(user ? [{ label: "Profil Saya", href: "/profile" }] : []),
    ...(user && (user.role === "admin" || user.role === "teacher")
      ? [{ label: "CMS Dashboard", href: "/dashboard", highlight: true }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-40 px-4 pt-3">
      <nav className="max-w-6xl mx-auto clay-navy px-5 sm:px-7 py-3.5">
        <div className="flex items-center justify-between gap-4">
          {/* Brand Logo Studyo */}
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2.5 group shrink-0"
          >
            <span className="w-9 h-9 rounded-2xl bg-[#FBE48B] text-[#182338] flex items-center justify-center font-black text-lg shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),inset_0_-3px_5px_rgba(180,140,20,0.3)] group-hover:scale-105 transition">
              S
            </span>
            <span className="text-xl font-extrabold tracking-tight text-white">
              Stud<span className="text-[#FBE48B]">yo</span>
            </span>
          </Link>

          {/* Menu Desktop (Tersembunyi di Mobile) */}
          <div className="hidden md:flex items-center gap-6 text-sm font-semibold">
            {navLinks.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    item.highlight
                      ? "text-[#FBE48B] hover:underline transition"
                      : isActive
                      ? "text-[#FBE48B] font-extrabold transition"
                      : "text-slate-200 hover:text-[#FBE48B] transition"
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Aksi Auth Desktop */}
          <div className="hidden md:flex items-center gap-2.5">
            {!user ? (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-full text-sm font-bold text-white hover:text-[#FBE48B] transition"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="clay-yellow px-5 py-2 text-sm font-extrabold"
                >
                  Daftar Gratis
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 bg-[#233250] px-3 py-1.5 rounded-full border border-[#344973] hover:border-[#FBE48B] transition"
                >
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.username}
                      className="w-6 h-6 rounded-full object-cover border border-[#FBE48B]"
                    />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-[#FBE48B]" />
                  )}
                  <span className="text-xs font-bold text-white">
                    {user.username}
                  </span>
                  <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-[#FBE48B] text-[#182338] font-extrabold">
                    {user.role}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-full text-xs font-bold bg-[#273757] hover:bg-red-500/90 text-white transition cursor-pointer"
                >
                  Keluar
                </button>
              </div>
            )}
          </div>

          {/* Tombol Burger Menu (Hanya Tampil di Layar Mobile < md) */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle Menu Navigasi"
            className="md:hidden w-10 h-10 rounded-2xl bg-[#233250] border border-[#344973] flex flex-col items-center justify-center gap-1.5 text-[#FBE48B] cursor-pointer"
          >
            <span
              className={`block w-5 h-0.5 bg-[#FBE48B] rounded-full transition-transform duration-200 ${
                menuOpen ? "translate-y-2 rotate-45" : ""
              }`}
            />
            <span
              className={`block w-5 h-0.5 bg-[#FBE48B] rounded-full transition-opacity duration-200 ${
                menuOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`block w-5 h-0.5 bg-[#FBE48B] rounded-full transition-transform duration-200 ${
                menuOpen ? "-translate-y-2 -rotate-45" : ""
              }`}
            />
          </button>
        </div>

        {/* Dropdown Drawer Mobile saat Burger Diklik */}
        {menuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-[#2E4166] space-y-3">
            <div className="flex flex-col space-y-2">
              {navLinks.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`px-4 py-2.5 rounded-2xl text-sm font-bold transition ${
                      isActive
                        ? "bg-[#FBE48B] text-[#182338]"
                        : "bg-[#233250]/70 text-white hover:bg-[#233250]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="pt-3 border-t border-[#2E4166]">
              {!user ? (
                <div className="grid grid-cols-2 gap-2.5">
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="text-center py-2.5 rounded-full text-xs font-extrabold bg-[#233250] text-white"
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMenuOpen(false)}
                    className="text-center clay-yellow py-2.5 text-xs font-extrabold"
                  >
                    Daftar Gratis
                  </Link>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3 bg-[#233250] p-3 rounded-2xl">
                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 min-w-0"
                  >
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.username}
                        className="w-8 h-8 rounded-full object-cover border border-[#FBE48B]"
                      />
                    ) : (
                      <span className="w-8 h-8 rounded-full bg-[#FBE48B] text-[#182338] flex items-center justify-center text-xs font-black">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-white truncate">
                        {user.username}
                      </p>
                      <span className="text-[10px] uppercase text-[#FBE48B] font-bold">
                        {user.role}
                      </span>
                    </div>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-full text-xs font-extrabold bg-red-500/90 text-white cursor-pointer shrink-0"
                  >
                    Keluar
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}