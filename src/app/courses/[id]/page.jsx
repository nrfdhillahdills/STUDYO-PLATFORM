import Link from "next/link";
import { notFound } from "next/navigation";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { enrollCourse } from "../actions";

export const dynamic = "force-dynamic";

function formatSchedule(startDate, endDate) {
  if (!startDate && !endDate) return "Lifetime Access (Tanpa Batas Waktu)";
  const opts = { day: "numeric", month: "long", year: "numeric" };
  const start = startDate ? new Date(startDate).toLocaleDateString("id-ID", opts) : "Sekarang";
  const end = endDate ? new Date(endDate).toLocaleDateString("id-ID", opts) : "Selesai";
  return `${start} – ${end}`;
}

export default async function CourseDetailPage({ params }) {
  const { id } = await params;
  if (!Number.isInteger(Number(id))) notFound();

  const user = await getCurrentUser();

  const { rows: courseRows } = await pool.query(
    `SELECT 
      c.*,
      cat.name AS category_name,
      u.username AS teacher_name,
      u.email AS teacher_email,
      COUNT(DISTINCT e.id)::int AS total_students
     FROM courses c
     LEFT JOIN categories cat ON c.category_id = cat.id
     LEFT JOIN users u ON c.teacher_id = u.id
     LEFT JOIN enrollments e ON c.id = e.course_id
     WHERE c.id = $1
     GROUP BY c.id, cat.name, u.username, u.email`,
    [Number(id)]
  );

  const course = courseRows[0];
  if (!course) notFound();

  const { rows: contents } = await pool.query(
    "SELECT id, title, order_index FROM contents WHERE course_id = $1 ORDER BY order_index ASC",
    [course.id]
  );

  const isStudent = !user || user.role === "student";
  const isOwnerOrAdmin =
    user &&
    (user.role === "admin" ||
      (user.role === "teacher" && course.teacher_id === user.id));

  let enrollment = null;
  let completedIds = new Set();

  if (user && user.role === "student") {
    const { rows: enrollRows } = await pool.query(
      "SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2",
      [user.id, course.id]
    );
    if (enrollRows.length > 0) {
      enrollment = enrollRows[0];
      const { rows: progressRows } = await pool.query(
        "SELECT content_id FROM content_progress WHERE enrollment_id = $1",
        [enrollment.id]
      );
      completedIds = new Set(progressRows.map((r) => r.content_id));
    }
  }

  const progressPercent =
    contents.length > 0 ? Math.round((completedIds.size / contents.length) * 100) : 0;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 text-xs font-extrabold text-[#182338] bg-white px-4 py-2 rounded-full border border-[#E6E0D2] hover:bg-[#FBE48B] transition"
        >
          &larr; Kembali ke Katalog
        </Link>
      </div>

      <section className="clay-navy p-7 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-8 space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="bg-[#FBE48B] text-[#182338] text-xs font-extrabold px-3.5 py-1 rounded-full">
              {course.category_name || "Umum"}
            </span>
            <span className="bg-[#243454] text-slate-200 text-xs font-semibold px-3.5 py-1 rounded-full border border-[#364C78]">
              {formatSchedule(course.start_date, course.end_date)}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
            {course.title}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            {course.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-200">
            <span>
              Pengajar: <strong className="text-[#FBE48B]">{course.teacher_name}</strong>
            </span>
            <span>•</span>
            <span>{contents.length} Materi Pembelajaran</span>
            <span>•</span>
            <span>{course.total_students} Siswa Terdaftar</span>
          </div>
        </div>

        {/* Kartu Aksi Kanan Menyesuaikan Role */}
        <div className="lg:col-span-4 bg-white text-[#182338] rounded-[28px] p-6 shadow-lg space-y-4">
          {!isStudent ? (
            <>
              <p className="text-sm font-extrabold text-[#182338]">
                Mode {user.role === "admin" ? "Administrator" : "Pengajar"}
              </p>
              <p className="text-xs text-[#5A657A] leading-relaxed">
                {isOwnerOrAdmin
                  ? "Anda dapat membaca materi dan membalas diskusi siswa secara langsung tanpa perlu mendaftar kelas."
                  : "Anda sedang melihat pratinjau kelas milik pengajar lain."}
              </p>

              {isOwnerOrAdmin && (
                <div className="space-y-2">
                  <Link
                    href={`/courses/${course.id}/learn`}
                    className="block w-full text-center clay-yellow py-3 text-sm font-extrabold"
                  >
                    Pantau Materi &amp; Balas Diskusi &rarr;
                  </Link>
                  <Link
                    href={`/dashboard/courses/${course.id}/contents`}
                    className="block w-full text-center py-2.5 rounded-full text-xs font-bold bg-[#182338] text-[#FBE48B]"
                  >
                    Kelola Bab Materi
                  </Link>
                </div>
              )}
            </>
          ) : enrollment ? (
            <>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-extrabold">
                  <span>Progres Belajarmu</span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="w-full h-3 bg-[#EFECE4] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#182338] rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-xs text-[#5A657A]">
                  {completedIds.size} dari {contents.length} materi telah selesai.
                </p>
              </div>

              <Link
                href={`/courses/${course.id}/learn`}
                className="block w-full text-center clay-yellow py-3 text-sm font-extrabold"
              >
                Lanjutkan Belajar &rarr;
              </Link>
            </>
          ) : (
            <>
              <p className="text-sm font-extrabold text-[#182338]">
                Siap mulai belajar bahasa ini?
              </p>
              <p className="text-xs text-[#5A657A] leading-relaxed">
                {user
                  ? "Klik tombol di bawah untuk mendaftar kelas dan membuka akses seluruh materi serta forum diskusi."
                  : "Silakan masuk atau daftar akun Student terlebih dahulu untuk mengikuti kelas ini."}
              </p>

              {user ? (
                <form action={enrollCourse}>
                  <input type="hidden" name="course_id" value={course.id} />
                  <button
                    type="submit"
                    className="w-full clay-yellow py-3 text-sm font-extrabold cursor-pointer"
                  >
                    Ikuti Course Sekarang
                  </button>
                </form>
              ) : (
                <Link
                  href="/login"
                  className="block w-full text-center clay-yellow py-3 text-sm font-extrabold"
                >
                  Masuk untuk Ikuti Course
                </Link>
              )}
            </>
          )}

          <a
            href={`mailto:${course.teacher_email}?subject=${encodeURIComponent(
              `Pertanyaan Mengenai Kursus: ${course.title}`
            )}`}
            className="block w-full text-center py-2.5 rounded-full text-xs font-bold border-2 border-[#182338] text-[#182338] hover:bg-[#182338] hover:text-[#FBE48B] transition"
          >
            Hubungi Teacher via Email
          </a>
        </div>
      </section>

      {/* Daftar Silabus Materi Pembelajaran */}
      <section className="clay-card p-6 sm:p-8 space-y-5">
        <div>
          <h2 className="text-xl font-extrabold text-[#182338]">
            Daftar Materi Pembelajaran
          </h2>
          <p className="text-sm text-[#5A657A]">
            Materi disusun secara berurutan agar mudah dipahami langkah demi langkah.
          </p>
        </div>

        {contents.length === 0 ? (
          <p className="text-sm text-[#5A657A] bg-[#FAF8F2] p-5 rounded-2xl">
            Pengajar belum menambahkan materi pada kelas ini.
          </p>
        ) : (
          <div className="space-y-3">
            {contents.map((item) => {
              const isDone = completedIds.has(item.id);
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-[#FAF8F2] border border-[#EAE4D7]"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="w-8 h-8 rounded-full bg-[#182338] text-[#FBE48B] flex items-center justify-center text-xs font-extrabold shrink-0">
                      {item.order_index}
                    </span>
                    <span className="text-sm font-bold text-[#182338]">
                      {item.title}
                    </span>
                  </div>

                  {isOwnerOrAdmin ? (
                    <Link
                      href={`/courses/${course.id}/learn?content=${item.id}`}
                      className="text-xs font-extrabold px-3.5 py-1.5 rounded-full bg-[#182338] text-[#FBE48B]"
                    >
                      Buka Materi &amp; Diskusi
                    </Link>
                  ) : enrollment ? (
                    <Link
                      href={`/courses/${course.id}/learn?content=${item.id}`}
                      className={`text-xs font-extrabold px-3.5 py-1.5 rounded-full transition ${
                        isDone
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-[#FBE48B] text-[#182338]"
                      }`}
                    >
                      {isDone ? "✓ Selesai" : "Buka Materi"}
                    </Link>
                  ) : (
                    <span className="text-xs font-semibold text-[#5A657A]">
                      {isStudent ? "Terkunci (Daftar dulu)" : "Hanya untuk Student"}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}