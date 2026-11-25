import Link from "next/link";
import { redirect } from "next/navigation";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { createCourse, deleteCourse } from "./actions";

export const dynamic = "force-dynamic";

function formatDateRange(startDate, endDate) {
  if (!startDate && !endDate) return "Lifetime Access";
  const opts = { day: "numeric", month: "short", year: "numeric" };
  const s = startDate ? new Date(startDate).toLocaleDateString("id-ID", opts) : "-";
  const e = endDate ? new Date(endDate).toLocaleDateString("id-ID", opts) : "-";
  return `${s} s.d. ${e}`;
}

export default async function ManageCoursesPage({ searchParams }) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "teacher")) {
    redirect("/dashboard");
  }

  const resolvedSearch = await searchParams;
  const successMsg = resolvedSearch?.success || "";
  const errorMsg = resolvedSearch?.error || "";

  // 1. Ambil daftar kategori untuk dropdown
  const { rows: categories } = await pool.query(
    "SELECT id, name FROM categories ORDER BY name ASC"
  );

  // 2. Jika Admin, ambil daftar user ber-role teacher (atau admin) untuk dropdown pengajar
  let teachers = [];
  if (user.role === "admin") {
    const { rows: teacherRows } = await pool.query(
      "SELECT id, username, email FROM users WHERE role IN ('teacher', 'admin') ORDER BY username ASC"
    );
    teachers = teacherRows;
  }

  // 3. Ambil daftar courses (Admin melihat semua, Teacher melihat miliknya)
  const coursesSql =
    user.role === "admin"
      ? `SELECT c.*, cat.name AS category_name, u.username AS teacher_name,
          COUNT(DISTINCT cnt.id)::int AS total_contents
         FROM courses c
         LEFT JOIN categories cat ON c.category_id = cat.id
         LEFT JOIN users u ON c.teacher_id = u.id
         LEFT JOIN contents cnt ON c.id = cnt.course_id
         GROUP BY c.id, cat.name, u.username
         ORDER BY c.created_at DESC`
      : `SELECT c.*, cat.name AS category_name, u.username AS teacher_name,
          COUNT(DISTINCT cnt.id)::int AS total_contents
         FROM courses c
         LEFT JOIN categories cat ON c.category_id = cat.id
         LEFT JOIN users u ON c.teacher_id = u.id
         LEFT JOIN contents cnt ON c.id = cnt.course_id
         WHERE c.teacher_id = $1
         GROUP BY c.id, cat.name, u.username
         ORDER BY c.created_at DESC`;

  const { rows: courses } =
    user.role === "admin"
      ? await pool.query(coursesSql)
      : await pool.query(coursesSql, [user.id]);

  return (
    <div className="space-y-6">
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs sm:text-sm font-bold">
          ✓ {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-100 border border-red-300 text-red-900 text-xs sm:text-sm font-bold">
          ✕ {errorMsg}
        </div>
      )}

      {/* FORM CREATE COURSE */}
      <section className="clay-card p-6 sm:p-8 space-y-5">
        <div>
          <h2 className="text-lg font-extrabold text-[#182338]">Buat Kelas Bahasa Baru</h2>
          <p className="text-xs text-[#5A657A]">
            Kosongkan tanggal mulai &amp; selesai jika kelas bersifat Lifetime Access (tanpa batas waktu).
          </p>
        </div>

        <form action={createCourse} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold mb-1.5">Nama Course *</label>
              <input
                type="text"
                name="title"
                placeholder="Contoh: Bahasa Korea Percakapan Sehari-hari"
                required
                className="w-full bg-[#FAF8F2] border-2 border-[#E6E0D2] rounded-2xl px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold mb-1.5">Kategori Bahasa *</label>
              <select
                name="category_id"
                required
                className="w-full bg-[#FAF8F2] border-2 border-[#E6E0D2] rounded-2xl px-4 py-2.5 text-sm font-semibold"
              >
                <option value="">-- Pilih Kategori --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold mb-1.5">Deskripsi Course *</label>
            <textarea
              name="description"
              rows={3}
              placeholder="Jelaskan target pembelajaran dan ringkasan kelas..."
              required
              className="w-full bg-[#FAF8F2] border-2 border-[#E6E0D2] rounded-2xl px-4 py-2.5 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Field Nama Teacher: Admin memilih dropdown, Teacher otomatis terisi */}
            <div>
              <label className="block text-xs font-extrabold mb-1.5">Nama Teacher *</label>
              {user.role === "admin" ? (
                <select
                  name="teacher_id"
                  required
                  className="w-full bg-[#FAF8F2] border-2 border-[#E6E0D2] rounded-2xl px-4 py-2.5 text-sm font-semibold"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.username} ({t.email})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={user.username}
                  readOnly
                  className="w-full bg-[#EFECE4] border-2 border-[#E6E0D2] rounded-2xl px-4 py-2.5 text-sm font-bold text-[#5A657A]"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-extrabold mb-1.5">
                Tanggal Mulai (Opsional)
              </label>
              <input
                type="date"
                name="start_date"
                className="w-full bg-[#FAF8F2] border-2 border-[#E6E0D2] rounded-2xl px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold mb-1.5">
                Tanggal Selesai (Opsional)
              </label>
              <input
                type="date"
                name="end_date"
                className="w-full bg-[#FAF8F2] border-2 border-[#E6E0D2] rounded-2xl px-4 py-2.5 text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="clay-yellow px-6 py-2.5 text-xs sm:text-sm font-extrabold cursor-pointer"
            >
              + Simpan &amp; Buat Kelas
            </button>
          </div>
        </form>
      </section>

      {/* DAFTAR COURSES */}
      <section className="clay-card p-6 space-y-4 overflow-x-auto">
        <h2 className="text-lg font-extrabold text-[#182338]">
          Daftar Kelas ({courses.length})
        </h2>

        {courses.length === 0 ? (
          <p className="text-xs text-[#5A657A]">Belum ada kelas yang tersedia.</p>
        ) : (
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-[#EFECE4] text-xs text-[#5A657A]">
                <th className="py-3 pr-4">Nama Kelas</th>
                <th className="py-3 pr-4">Kategori</th>
                <th className="py-3 pr-4">Teacher</th>
                <th className="py-3 pr-4">Rentang Waktu</th>
                <th className="py-3 pr-4">Materi</th>
                <th className="py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.id} className="border-b border-[#EFECE4]">
                  <td className="py-3.5 pr-4 font-extrabold text-[#182338]">{c.title}</td>
                  <td className="py-3.5 pr-4">
                    <span className="bg-[#FBE48B] text-[#182338] text-xs font-extrabold px-3 py-1 rounded-full">
                      {c.category_name || "Umum"}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4 text-xs font-semibold">{c.teacher_name}</td>
                  <td className="py-3.5 pr-4 text-xs text-[#5A657A]">
                    {formatDateRange(c.start_date, c.end_date)}
                  </td>
                  <td className="py-3.5 pr-4 text-xs font-bold">{c.total_contents} Bab</td>
                  <td className="py-3.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/dashboard/courses/${c.id}/contents`}
                        className="bg-[#182338] text-[#FBE48B] text-xs font-extrabold px-3.5 py-1.5 rounded-full"
                      >
                        Kelola Materi
                      </Link>
                      <Link
                        href={`/courses/${c.id}/learn`}
                        className="clay-yellow text-xs font-extrabold px-3.5 py-1.5"
                      >
                        Diskusi
                      </Link>
                      <Link
                        href={`/dashboard/courses/${c.id}/edit`}
                        className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#FAF8F2] border border-[#E6E0D2] hover:bg-[#FBE48B] transition"
                      >
                        Edit
                      </Link>
                      <form action={deleteCourse}>
                        <input type="hidden" name="course_id" value={c.id} />
                        <button
                          type="submit"
                          className="px-3 py-1.5 rounded-full text-xs font-bold bg-red-50 text-red-700 hover:bg-red-600 hover:text-white transition cursor-pointer"
                        >
                          Hapus
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}