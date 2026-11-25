import Link from "next/link";
import { redirect } from "next/navigation";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import EditProfilePanel from "@/components/EditProfilePanel";

export const dynamic = "force-dynamic";

export default async function ProfilePage({ searchParams }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const resolvedSearch = await searchParams;
  const successMsg = resolvedSearch?.success || "";
  const errorMsg = resolvedSearch?.error || "";

  // 1. Cek Logika Status Pending Teacher (Khusus pendaftar Teacher yang belum di-approve)
  const isPendingTeacher =
    user.role === "student" && user.teacher_status === "pending";

  // 2. Cek Logika Welcome Teacher di Server Component (< 24 jam sejak approved_at)
  let showWelcomeTeacher = false;
  if (user.role === "teacher" && user.approved_at) {
    const approvedTime = new Date(user.approved_at).getTime();
    const nowTime = Date.now();
    const twentyFourHoursMs = 24 * 60 * 60 * 1000;
    if (nowTime - approvedTime >= 0 && nowTime - approvedTime < twentyFourHoursMs) {
      showWelcomeTeacher = true;
    }
  }

  // 3. Query Kursus yang Diikuti (Khusus role Student)
  let enrolledCourses = [];
  if (user.role === "student") {
    const { rows: enrollRows } = await pool.query(
      `SELECT
        c.id,
        c.title,
        cat.name AS category_name,
        u.username AS teacher_name,
        e.enrolled_at,
        COUNT(DISTINCT cnt.id)::int AS total_materials,
        COUNT(DISTINCT cp.content_id)::int AS completed_materials,
        MAX(cert.certificate_code) AS certificate_code
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       LEFT JOIN categories cat ON c.category_id = cat.id
       LEFT JOIN users u ON c.teacher_id = u.id
       LEFT JOIN contents cnt ON c.id = cnt.course_id
       LEFT JOIN content_progress cp ON e.id = cp.enrollment_id
       LEFT JOIN certificates cert ON e.id = cert.enrollment_id
       WHERE e.student_id = $1
       GROUP BY c.id, cat.name, u.username, e.enrolled_at
       ORDER BY e.enrolled_at DESC`,
      [user.id]
    );
    enrolledCourses = enrollRows;
  }

  // 4. Query Kursus yang Diajarkan & Progres Student (Khusus Teacher / Admin)
  let taughtCourses = [];
  let studentProgressList = [];

  if (user.role === "teacher" || user.role === "admin") {
    const { rows: taughtRows } = await pool.query(
      `SELECT
        c.id,
        c.title,
        cat.name AS category_name,
        COUNT(DISTINCT cnt.id)::int AS total_materials,
        COUNT(DISTINCT e.id)::int AS total_students
       FROM courses c
       LEFT JOIN categories cat ON c.category_id = cat.id
       LEFT JOIN contents cnt ON c.id = cnt.course_id
       LEFT JOIN enrollments e ON c.id = e.course_id
       WHERE c.teacher_id = $1
       GROUP BY c.id, cat.name
       ORDER BY c.created_at DESC`,
      [user.id]
    );
    taughtCourses = taughtRows;

    const { rows: progressRows } = await pool.query(
      `SELECT
        c.id AS course_id,
        c.title AS course_title,
        s.username AS student_name,
        s.email AS student_email,
        (SELECT COUNT(*)::int FROM contents WHERE course_id = c.id) AS total_materials,
        COUNT(DISTINCT cp.content_id)::int AS completed_materials
       FROM courses c
       JOIN enrollments e ON c.id = e.course_id
       JOIN users s ON e.student_id = s.id
       LEFT JOIN content_progress cp ON e.id = cp.enrollment_id
       WHERE c.teacher_id = $1
       GROUP BY c.id, c.title, s.id, s.username, s.email
       ORDER BY c.title ASC, s.username ASC`,
      [user.id]
    );
    studentProgressList = progressRows;
  }

  return (
    <div className="space-y-8">
      {/* ALERT SUKSES / ERROR UPDATE PROFIL */}
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

      {/* NOTIFIKASI WELCOME TEACHER (Muncul jika di-approve Admin < 24 jam) */}
      {showWelcomeTeacher && (
        <div className="clay-yellow p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-2 border-[#182338]">
          <div className="space-y-1">
            <span className="inline-block bg-[#182338] text-[#FBE48B] text-[11px] font-extrabold px-3 py-0.5 rounded-full">
              🎉 Akun Pengajar Disetujui
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#182338]">
              Welcome Teacher, {user.username}!
            </h2>
            <p className="text-xs sm:text-sm text-[#182338]/85">
              Pengajuan pengajar Anda telah diverifikasi oleh Admin. Sekarang Anda dapat
              membuat kelas bahasa dan menyusun materi pembelajaran di CMS Dashboard.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="bg-[#182338] hover:bg-[#263757] text-[#FBE48B] text-xs sm:text-sm font-extrabold px-5 py-3 rounded-full text-center shrink-0 transition"
          >
            Buka CMS Dashboard &rarr;
          </Link>
        </div>
      )}

      {/* KARTU INFORMASI PROFIL PENGGUNA */}
      <section className="clay-navy p-7 sm:p-10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[26px] overflow-hidden bg-[#FBE48B] text-[#182338] flex items-center justify-center text-2xl sm:text-3xl font-black shrink-0 shadow-[inset_0_4px_8px_rgba(255,255,255,0.85),inset_0_-4px_8px_rgba(180,140,20,0.3)]">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                user.username.charAt(0).toUpperCase()
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {user.username}
                </h1>
                <span className="bg-[#FBE48B] text-[#182338] text-xs uppercase font-extrabold px-3 py-1 rounded-full">
                  {user.role}
                </span>
              </div>

              <p className="text-sm text-slate-300">{user.email}</p>

              {/* Badge Status Pending (Khusus Pendaftar Teacher yang belum di-approve) */}
              {isPendingTeacher && (
                <div className="pt-2">
                  <span className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-300/50 text-[#FBE48B] text-xs font-bold px-4 py-2 rounded-2xl">
                    <span className="w-2 h-2 rounded-full bg-[#FBE48B] animate-pulse" />
                    Akun Pengajar Anda sedang menunggu verifikasi Admin
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {(user.role === "teacher" || user.role === "admin") && (
              <Link
                href="/dashboard"
                className="clay-yellow px-5 py-3 text-xs sm:text-sm font-extrabold"
              >
                Kelola Kelas (CMS) &rarr;
              </Link>
            )}
            <Link
              href="/courses"
              className="px-5 py-3 rounded-full text-xs sm:text-sm font-bold bg-[#233250] hover:bg-[#2F4369] text-white border border-[#3A517D] transition"
            >
              Eksplorasi Kelas
            </Link>
          </div>
        </div>

        {/* TOMBOL & PANEL EDIT PROFIL + UPLOAD FOTO */}
        <div className="pt-4 border-t border-[#2E4166]">
          <EditProfilePanel user={user} />
        </div>
      </section>

      {/* BAGIAN TEACHER / ADMIN: KURSUS YANG DIAJARKAN, DISKUSI & PROGRES STUDENT */}
      {(user.role === "teacher" || user.role === "admin") && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#182338]">
                Kursus yang Anda Ajarkan ({taughtCourses.length})
              </h2>
              <p className="text-sm text-[#5A657A]">
                Kelola materi, balas diskusi siswa, dan pantau perkembangan belajar di kelas Anda.
              </p>
            </div>
            <Link
              href="/dashboard/courses"
              className="bg-[#182338] text-[#FBE48B] text-xs font-extrabold px-4 py-2.5 rounded-full"
            >
              + Kelola Kursus &amp; Materi
            </Link>
          </div>

          {taughtCourses.length === 0 ? (
            <div className="clay-card p-8 text-center space-y-2">
              <p className="text-base font-bold text-[#182338]">
                Anda belum membuat kursus bahasa.
              </p>
              <p className="text-xs text-[#5A657A]">
                Mulai buat kelas pertamamu melalui menu CMS Dashboard.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {taughtCourses.map((course) => (
                <div key={course.id} className="clay-card p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="bg-[#FBE48B] text-[#182338] text-xs font-extrabold px-3 py-1 rounded-full">
                      {course.category_name || "Umum"}
                    </span>
                    <span className="text-xs font-bold text-[#5A657A]">
                      {course.total_students} Siswa • {course.total_materials} Materi
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-[#182338]">
                    {course.title}
                  </h3>

                  <div className="pt-2 flex flex-wrap items-center gap-2.5">
                    <Link
                      href={`/courses/${course.id}/learn`}
                      className="clay-yellow text-xs font-extrabold px-4 py-2"
                    >
                      Pantau &amp; Balas Diskusi
                    </Link>
                    <Link
                      href={`/dashboard/courses/${course.id}/contents`}
                      className="bg-[#182338] text-[#FBE48B] text-xs font-bold px-4 py-2 rounded-full"
                    >
                      Kelola Materi
                    </Link>
                    <Link
                      href={`/courses/${course.id}`}
                      className="text-xs font-bold text-[#182338] hover:underline px-2"
                    >
                      Detail Kelas
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tabel Monitoring Progres Student pada Kelas Teacher */}
          <div className="clay-card p-6 space-y-4 overflow-x-auto">
            <h3 className="text-base font-extrabold text-[#182338]">
              Perkembangan Belajar Siswa di Kelas Anda
            </h3>

            {studentProgressList.length === 0 ? (
              <p className="text-xs text-[#5A657A]">
                Belum ada siswa yang mendaftar di kelas Anda.
              </p>
            ) : (
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b-2 border-[#EFECE4] text-xs text-[#5A657A]">
                    <th className="py-3 pr-4">Nama Siswa</th>
                    <th className="py-3 pr-4">Kelas</th>
                    <th className="py-3 pr-4">Materi Selesai</th>
                    <th className="py-3">Progres</th>
                  </tr>
                </thead>
                <tbody>
                  {studentProgressList.map((row, idx) => {
                    const pct =
                      row.total_materials > 0
                        ? Math.round((row.completed_materials / row.total_materials) * 100)
                        : 0;
                    return (
                      <tr key={idx} className="border-b border-[#EFECE4]">
                        <td className="py-3 pr-4 font-bold text-[#182338]">
                          {row.student_name}
                          <span className="block text-[11px] font-normal text-[#5A657A]">
                            {row.student_email}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-xs font-semibold">
                          {row.course_title}
                        </td>
                        <td className="py-3 pr-4 text-xs">
                          {row.completed_materials} / {row.total_materials}
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-[#EFECE4] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#182338] rounded-full"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-xs font-extrabold">{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>
      )}

      {/* BAGIAN KHUSUS STUDENT: KURSUS YANG DIIKUTI DENGAN PROGRESS & SERTIFIKAT */}
      {user.role === "student" && (
        <section className="space-y-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#182338]">
              Kursus yang Anda Ikuti ({enrolledCourses.length})
            </h2>
            <p className="text-sm text-[#5A657A]">
              Lanjutkan sesi belajarmu atau unduh sertifikat untuk kelas yang telah tuntas 100%.
            </p>
          </div>

          {enrolledCourses.length === 0 ? (
            <div className="clay-card p-10 text-center space-y-3">
              <p className="text-base font-bold text-[#182338]">
                Kamu belum mengikuti kelas bahasa apapun.
              </p>
              <p className="text-xs text-[#5A657A]">
                Pilih kursus bahasa di katalog untuk mulai belajar sekarang.
              </p>
              <Link
                href="/courses"
                className="inline-block clay-yellow px-5 py-2.5 text-xs font-extrabold mt-2"
              >
                Lihat Katalog Kursus &rarr;
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((item) => {
                const progressPercent =
                  item.total_materials > 0
                    ? Math.round((item.completed_materials / item.total_materials) * 100)
                    : 0;

                return (
                  <article
                    key={item.id}
                    className="clay-card p-6 flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="bg-[#FBE48B] text-[#182338] text-xs font-extrabold px-3 py-1 rounded-full">
                          {item.category_name || "Umum"}
                        </span>
                        {progressPercent === 100 && (
                          <span className="bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
                            ✓ Lulus
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-extrabold text-[#182338] leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-xs text-[#5A657A]">
                        Pengajar: {item.teacher_name}
                      </p>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-[#EFECE4]">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-[#5A657A]">
                            {item.completed_materials}/{item.total_materials} Materi
                          </span>
                          <span className="text-[#182338]">{progressPercent}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-[#EFECE4] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#182338] rounded-full transition-all"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/courses/${item.id}/learn`}
                          className="flex-1 text-center clay-yellow py-2.5 px-4 text-xs font-extrabold"
                        >
                          Lanjutkan Belajar &rarr;
                        </Link>

                        {item.certificate_code && (
                          <Link
                            href={`/certificates/${item.certificate_code}`}
                            className="bg-[#182338] text-[#FBE48B] text-xs font-extrabold px-3.5 py-2.5 rounded-full"
                          >
                            Sertifikat
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}