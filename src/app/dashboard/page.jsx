import Link from "next/link";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardOverviewPage() {
  const user = await getCurrentUser();

  if (user.role === "admin") {
    const { rows: statsRows } = await pool.query(`
      SELECT
        (SELECT COUNT(*)::int FROM users) AS total_users,
        (SELECT COUNT(*)::int FROM users WHERE role = 'student' AND teacher_status = 'pending') AS pending_teachers,
        (SELECT COUNT(*)::int FROM courses) AS total_courses,
        (SELECT COUNT(*)::int FROM categories) AS total_categories
    `);
    const stats = statsRows[0];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="clay-card p-6">
            <p className="text-xs font-bold text-[#5A657A]">Total Pengguna</p>
            <p className="text-3xl font-extrabold text-[#182338] mt-1">{stats.total_users}</p>
          </div>
          <div className="clay-yellow p-6">
            <p className="text-xs font-extrabold text-[#182338]/80">Teacher Menunggu Verifikasi</p>
            <p className="text-3xl font-extrabold text-[#182338] mt-1">{stats.pending_teachers}</p>
          </div>
          <div className="clay-card p-6">
            <p className="text-xs font-bold text-[#5A657A]">Total Kelas Bahasa</p>
            <p className="text-3xl font-extrabold text-[#182338] mt-1">{stats.total_courses}</p>
          </div>
          <div className="clay-card p-6">
            <p className="text-xs font-bold text-[#5A657A]">Kategori Bahasa</p>
            <p className="text-3xl font-extrabold text-[#182338] mt-1">{stats.total_categories}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link href="/dashboard/users" className="clay-card p-6 block space-y-2">
            <span className="inline-block bg-[#FBE48B] text-[#182338] text-xs font-extrabold px-3 py-1 rounded-full">
              Modul Admin 1
            </span>
            <h2 className="text-lg font-extrabold text-[#182338]">User Management</h2>
            <p className="text-xs text-[#5A657A]">
              Kelola seluruh akun pengguna dan setujui pengajuan Teacher berstatus Pending.
            </p>
          </Link>

          <Link href="/dashboard/courses" className="clay-card p-6 block space-y-2">
            <span className="inline-block bg-[#FBE48B] text-[#182338] text-xs font-extrabold px-3 py-1 rounded-full">
              Modul 2 &amp; 3
            </span>
            <h2 className="text-lg font-extrabold text-[#182338]">Course &amp; Content</h2>
            <p className="text-xs text-[#5A657A]">
              Buat kelas baru, atur pengajar, jadwal kelas, dan susun materi pembelajaran.
            </p>
          </Link>

          <Link href="/dashboard/categories" className="clay-card p-6 block space-y-2">
            <span className="inline-block bg-[#FBE48B] text-[#182338] text-xs font-extrabold px-3 py-1 rounded-full">
              Modul Admin 4
            </span>
            <h2 className="text-lg font-extrabold text-[#182338]">Category Management</h2>
            <p className="text-xs text-[#5A657A]">
              Tambah, ubah, atau hapus kategori bahasa untuk dropdown pembuatan kelas.
            </p>
          </Link>
        </div>
      </div>
    );
  }

  // Tampilan Overview untuk Teacher
  const { rows: teacherStats } = await pool.query(
    `SELECT
      COUNT(DISTINCT c.id)::int AS my_courses,
      COUNT(DISTINCT cnt.id)::int AS my_contents,
      COUNT(DISTINCT e.id)::int AS my_students
     FROM courses c
     LEFT JOIN contents cnt ON c.id = cnt.course_id
     LEFT JOIN enrollments e ON c.id = e.course_id
     WHERE c.teacher_id = $1`,
    [user.id]
  );
  const tStats = teacherStats[0];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="clay-card p-6">
          <p className="text-xs font-bold text-[#5A657A]">Kelas Saya</p>
          <p className="text-3xl font-extrabold text-[#182338] mt-1">{tStats.my_courses}</p>
        </div>
        <div className="clay-card p-6">
          <p className="text-xs font-bold text-[#5A657A]">Total Materi Dibuat</p>
          <p className="text-3xl font-extrabold text-[#182338] mt-1">{tStats.my_contents}</p>
        </div>
        <div className="clay-yellow p-6">
          <p className="text-xs font-extrabold text-[#182338]/80">Total Siswa Terdaftar</p>
          <p className="text-3xl font-extrabold text-[#182338] mt-1">{tStats.my_students}</p>
        </div>
      </div>

      <div className="clay-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-[#182338]">
            Kelola Kelas Bahasa &amp; Materi Pembelajaran
          </h2>
          <p className="text-xs text-[#5A657A]">
            Buat kursus bahasa baru atau tambahkan bab materi berurutan di kelas Anda.
          </p>
        </div>
        <Link
          href="/dashboard/courses"
          className="clay-yellow px-5 py-3 text-xs sm:text-sm font-extrabold text-center"
        >
          Kelola Course &amp; Materi &rarr;
        </Link>
      </div>
    </div>
  );
}