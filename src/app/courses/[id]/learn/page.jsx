import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { markContentAsDone, postDiscussionComment } from "./actions";

export const dynamic = "force-dynamic";

export default async function LearnCoursePage({ params, searchParams }) {
  const { id } = await params;
  if (!Number.isInteger(Number(id))) notFound();

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const resolvedSearch = await searchParams;
  const requestedContentId = resolvedSearch?.content ? Number(resolvedSearch.content) : null;

  const { rows: courseRows } = await pool.query(
    `SELECT c.id, c.title, c.teacher_id, u.username AS teacher_name
     FROM courses c
     LEFT JOIN users u ON c.teacher_id = u.id
     WHERE c.id = $1`,
    [Number(id)]
  );
  const course = courseRows[0];
  if (!course) notFound();

  const isStudent = user.role === "student";
  const isOwnerOrAdmin =
    user.role === "admin" || (user.role === "teacher" && course.teacher_id === user.id);

  let enrollmentId = null;
  let completedSet = new Set();
  let certificate = null;

  if (isStudent) {
    const { rows: enrollRows } = await pool.query(
      "SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2",
      [user.id, course.id]
    );
    if (enrollRows.length === 0) {
      redirect(`/courses/${course.id}`);
    }
    enrollmentId = enrollRows[0].id;

    const { rows: progressRows } = await pool.query(
      "SELECT content_id FROM content_progress WHERE enrollment_id = $1",
      [enrollmentId]
    );
    completedSet = new Set(progressRows.map((r) => r.content_id));

    const { rows: certRows } = await pool.query(
      "SELECT certificate_code, issued_at FROM certificates WHERE enrollment_id = $1",
      [enrollmentId]
    );
    certificate = certRows[0] || null;
  } else if (!isOwnerOrAdmin) {
    redirect(`/courses/${course.id}`);
  }

  const { rows: contents } = await pool.query(
    "SELECT id, title, body, order_index FROM contents WHERE course_id = $1 ORDER BY order_index ASC",
    [course.id]
  );

  if (contents.length === 0) {
    return (
      <div className="clay-card p-10 text-center space-y-4">
        <h1 className="text-2xl font-extrabold text-[#182338]">{course.title}</h1>
        <p className="text-sm text-[#5A657A]">
          Belum ada materi pembelajaran di kelas ini.
        </p>
        <Link
          href={`/courses/${course.id}`}
          className="inline-block clay-yellow px-5 py-2.5 text-xs font-extrabold"
        >
          &larr; Kembali ke Detail Kelas
        </Link>
      </div>
    );
  }

  let currentIndex = contents.findIndex((c) => c.id === requestedContentId);
  if (currentIndex === -1) {
    const firstUnfinished = contents.findIndex((c) => !completedSet.has(c.id));
    currentIndex = firstUnfinished !== -1 ? firstUnfinished : 0;
  }

  const activeContent = contents[currentIndex];
  const nextContent = contents[currentIndex + 1] || null;
  const isCurrentDone = completedSet.has(activeContent.id);
  const progressPercent = Math.round((completedSet.size / contents.length) * 100);

  const { rows: discussions } = await pool.query(
    `SELECT d.id, d.comment, d.created_at, u.username, u.role
     FROM discussions d
     JOIN users u ON d.user_id = u.id
     WHERE d.content_id = $1
     ORDER BY d.created_at ASC`,
    [activeContent.id]
  );

  return (
    <div className="space-y-6">
      {/* Top Bar Navigasi & Progress (Progress hanya untuk Student) */}
      <div className="clay-navy p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href={`/courses/${course.id}`}
            className="text-xs font-bold text-[#FBE48B] hover:underline"
          >
            &larr; Kembali ke Detail Kelas
          </Link>
          <h1 className="text-lg sm:text-2xl font-extrabold text-white">
            {course.title}
          </h1>
        </div>

        {isStudent ? (
          <div className="w-full sm:w-64 space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-200">
              <span>Progres Belajar</span>
              <span className="text-[#FBE48B]">
                {completedSet.size}/{contents.length} ({progressPercent}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-[#253554] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#FBE48B] rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        ) : (
          <span className="bg-[#FBE48B] text-[#182338] text-xs font-extrabold px-4 py-2 rounded-full">
            Mode {user.role === "admin" ? "Admin" : "Instruktur"} • Pantau Diskusi
          </span>
        )}
      </div>

      {/* Banner Sertifikat Khusus Student yang 100% Selesai */}
      {isStudent && certificate && (
        <div className="clay-yellow p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-block bg-[#182338] text-[#FBE48B] text-[11px] font-extrabold px-3 py-0.5 rounded-full">
              100% Selesai • Sertifikat Terbit
            </span>
            <h2 className="text-lg font-extrabold text-[#182338]">
              Selamat! Kamu telah menyelesaikan seluruh materi kelas ini.
            </h2>
            <p className="text-xs text-[#182338]/80 font-semibold">
              Kode Verifikasi Sertifikat:{" "}
              <span className="font-mono font-bold">{certificate.certificate_code}</span>
            </p>
          </div>

          <Link
            href={`/certificates/${certificate.certificate_code}`}
            className="bg-[#182338] hover:bg-[#263757] text-[#FBE48B] text-xs sm:text-sm font-extrabold px-5 py-3 rounded-full text-center shrink-0 transition"
          >
            Lihat &amp; Cetak Sertifikat &rarr;
          </Link>
        </div>
      )}

      {/* Grid Utama */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <aside className="lg:col-span-4 clay-card p-5 space-y-3">
          <h2 className="text-sm font-extrabold text-[#182338] px-1">
            Daftar Materi ({contents.length})
          </h2>

          <div className="space-y-2">
            {contents.map((item) => {
              const isSelected = item.id === activeContent.id;
              const isDone = isStudent && completedSet.has(item.id);

              return (
                <Link
                  key={item.id}
                  href={`/courses/${course.id}/learn?content=${item.id}`}
                  className={`flex items-center justify-between gap-3 p-3.5 rounded-2xl text-xs font-bold transition ${
                    isSelected
                      ? "bg-[#182338] text-white shadow-sm"
                      : "bg-[#FAF8F2] text-[#182338] hover:bg-[#FBE48B]/40"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-extrabold shrink-0 ${
                        isSelected
                          ? "bg-[#FBE48B] text-[#182338]"
                          : "bg-[#182338] text-[#FBE48B]"
                      }`}
                    >
                      {item.order_index}
                    </span>
                    <span className="truncate">{item.title}</span>
                  </div>

                  {isDone && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 text-[10px] font-extrabold shrink-0">
                      ✓
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </aside>

        <div className="lg:col-span-8 space-y-6">
          <article className="clay-card p-6 sm:p-8 space-y-6">
            <div className="border-b border-[#EFECE4] pb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs font-extrabold text-[#5A657A]">
                  Materi #{activeContent.order_index} • Pengajar: {course.teacher_name}
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#182338] mt-1">
                  {activeContent.title}
                </h2>
              </div>

              {isStudent && isCurrentDone && (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3.5 py-1.5 rounded-full">
                  ✓ Sudah Selesai
                </span>
              )}
            </div>

            <div
              className="rich-content text-sm sm:text-base text-[#182338]"
              dangerouslySetInnerHTML={{ __html: activeContent.body }}
            />

            {/* Tombol Aksi Bawah */}
            <div className="pt-6 border-t border-[#EFECE4] flex flex-wrap items-center justify-between gap-3">
              {isStudent ? (
                <form action={markContentAsDone}>
                  <input type="hidden" name="course_id" value={course.id} />
                  <input type="hidden" name="content_id" value={activeContent.id} />
                  {nextContent && (
                    <input type="hidden" name="next_content_id" value={nextContent.id} />
                  )}
                  <button
                    type="submit"
                    className={`px-5 py-3 rounded-full text-xs sm:text-sm font-extrabold transition cursor-pointer ${
                      isCurrentDone
                        ? "bg-emerald-600 text-white"
                        : "bg-[#182338] hover:bg-[#263757] text-[#FBE48B]"
                    }`}
                  >
                    {isCurrentDone ? "✓ Materi Telah Ditandai Selesai" : "Mark as Done"}
                  </button>
                </form>
              ) : (
                <Link
                  href={`/dashboard/courses/${course.id}/contents/${activeContent.id}/edit`}
                  className="bg-[#182338] hover:bg-[#263757] text-[#FBE48B] px-5 py-3 rounded-full text-xs sm:text-sm font-extrabold transition"
                >
                  Edit Materi Ini &rarr;
                </Link>
              )}

              {nextContent ? (
                <Link
                  href={`/courses/${course.id}/learn?content=${nextContent.id}`}
                  className="clay-yellow px-6 py-3 text-xs sm:text-sm font-extrabold"
                >
                  Lanjutkan ke Materi Berikutnya &rarr;
                </Link>
              ) : (
                <Link
                  href={isStudent ? "/profile" : "/dashboard/courses"}
                  className="clay-yellow px-6 py-3 text-xs sm:text-sm font-extrabold"
                >
                  {isStudent ? "Selesai • Lihat Profil & Progres →" : "Kembali ke Daftar Kelas →"}
                </Link>
              )}
            </div>
          </article>

          {/* FORUM DISKUSI */}
          <section className="clay-card p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-extrabold text-[#182338]">
                Forum Diskusi Materi ({discussions.length})
              </h3>
              <p className="text-xs text-[#5A657A]">
                {isStudent
                  ? "Ajukan pertanyaan kosakata atau tata bahasa pada materi ini."
                  : "Balas pertanyaan dan bantu siswa memahami materi ini."}
              </p>
            </div>

            <form action={postDiscussionComment} className="space-y-3">
              <input type="hidden" name="course_id" value={course.id} />
              <input type="hidden" name="content_id" value={activeContent.id} />
              <textarea
                name="comment"
                rows={3}
                required
                placeholder={
                  isStudent
                    ? "Tulis pertanyaan atau catatan diskusimu di sini..."
                    : "Tulis balasan atau penjelasan tambahan untuk siswa..."
                }
                className="w-full bg-[#FAF8F2] border-2 border-[#E6E0D2] rounded-2xl p-4 text-sm text-[#182338] focus:outline-none focus:border-[#182338]"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-[#182338] hover:bg-[#263757] text-[#FBE48B] text-xs font-extrabold px-5 py-2.5 rounded-full transition cursor-pointer"
                >
                  {isStudent ? "Kirim Komentar" : "Kirim Balasan"}
                </button>
              </div>
            </form>

            <div className="space-y-3">
              {discussions.length === 0 ? (
                <p className="text-xs text-[#5A657A] bg-[#FAF8F2] p-4 rounded-2xl text-center">
                  Belum ada diskusi pada materi ini.
                </p>
              ) : (
                discussions.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#EAE4D7] space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-[#182338]">
                          {item.username}
                        </span>
                        <span
                          className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full ${
                            item.role === "teacher" || item.role === "admin"
                              ? "bg-[#182338] text-[#FBE48B]"
                              : "bg-[#FBE48B] text-[#182338]"
                          }`}
                        >
                          {item.role}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#5A657A]">
                        {new Date(item.created_at).toLocaleString("id-ID", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-[#182338] leading-relaxed">
                      {item.comment}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}