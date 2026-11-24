import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 px-4 pb-6">
      <div className="max-w-6xl mx-auto clay-navy px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-[#FBE48B] text-[#182338] flex items-center justify-center font-black">
            S
          </span>
          <div>
            <p className="font-extrabold text-white">
              Stud<span className="text-[#FBE48B]">yo</span> Language Learning
            </p>
            <p className="text-xs text-slate-300">
              Platform Kursus Bahasa Interaktif • Pemrograman Web 2026
            </p>
          </div>
        </div>

        <div className="flex items-center gap-5 text-xs text-slate-300">
          <Link href="/" className="hover:text-[#FBE48B] transition">
            Beranda
          </Link>
          <Link href="/courses" className="hover:text-[#FBE48B] transition">
            Katalog Kursus
          </Link>
          <Link href="/register" className="hover:text-[#FBE48B] transition">
            Jadi Pengajar
          </Link>
        </div>
      </div>
    </footer>
  );
}