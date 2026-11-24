import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardLayout({ children }) {
  const user = await getCurrentUser();

  if (!user || (user.role !== "admin" && user.role !== "teacher")) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      {/* Header Navigasi CMS */}
      <div className="clay-navy p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="inline-block bg-[#FBE48B] text-[#182338] text-[11px] uppercase font-extrabold px-3 py-0.5 rounded-full">
            CMS Panel • {user.role}
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            Studyo Management System
          </h1>
        </div>

        <nav className="flex flex-wrap items-center gap-2 text-xs font-extrabold">
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-full bg-[#243454] hover:bg-[#FBE48B] hover:text-[#182338] text-white transition"
          >
            Ringkasan
          </Link>

          <Link
            href="/dashboard/courses"
            className="px-4 py-2 rounded-full bg-[#243454] hover:bg-[#FBE48B] hover:text-[#182338] text-white transition"
          >
            Course &amp; Materi
          </Link>

          {user.role === "admin" && (
            <>
              <Link
                href="/dashboard/users"
                className="px-4 py-2 rounded-full bg-[#243454] hover:bg-[#FBE48B] hover:text-[#182338] text-white transition"
              >
                User &amp; Verifikasi Teacher
              </Link>
              <Link
                href="/dashboard/categories"
                className="px-4 py-2 rounded-full bg-[#243454] hover:bg-[#FBE48B] hover:text-[#182338] text-white transition"
              >
                Kategori Bahasa
              </Link>
            </>
          )}
        </nav>
      </div>

      {children}
    </div>
  );
}