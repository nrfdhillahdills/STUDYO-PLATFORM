import Link from "next/link";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { enrollCourse } from "./actions";

export const dynamic = "force-dynamic";

function formatSchedule(startDate, endDate) {
  if (!startDate && !endDate) return "Lifetime Access";
  const opts = { day: "numeric", month: "short", year: "numeric" };
  const start = startDate ? new Date(startDate).toLocaleDateString("id-ID", opts) : "Sekarang";
  const end = endDate ? new Date(endDate).toLocaleDateString("id-ID", opts) : "Selesai";
  return `${start} – ${end}`;
}

export default async function CoursesCatalogPage({ searchParams }) {
  const user = await getCurrentUser();
  const resolvedParams = await searchParams;
  const searchQuery = resolvedParams?.q || "";
  const selectedCategory = resolvedParams?.category || "";

  // 1. Ambil daftar kategori
  const { rows: categories } = await pool.query(
    "SELECT id, name FROM categories ORDER BY name ASC"
  );

  // 2. Query seluruh course + informasi progress khusus student yang sedang login
  const queryParams = [user && user.role === "student" ? user.id : null];
  const conditions = [];

  if (searchQuery.trim() !== "") {
    queryParams.push(`%${searchQuery.trim()}%`);
    conditions.push(
      `(c.title ILIKE $${queryParams.length} OR c.description ILIKE $${queryParams.length})`
    );
  }

  if (selectedCategory !== "") {
    queryParams.push(Number(selectedCategory));
    conditions.push(`c.category_id = $${queryParams.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const catalogSql = `
    SELECT
      c.id,
      c.title,
      c.description,
      c.category_id,
      c.teacher_id,
      c.start_date,
      c.end_date,
      cat.name AS category_name,
      u.username AS teacher_name,
      u.email AS teacher_email,
      COUNT(DISTINCT cnt.id)::int AS total_materials,
      MAX(e.id) AS enrollment_id,
      COUNT(DISTINCT cp.content_id)::int AS completed_materials
    FROM courses c
    LEFT JOIN categories cat ON c.category_id = cat.id
    LEFT JOIN users u ON c.teacher_id = u.id
    LEFT JOIN contents cnt ON c.id = cnt.course_id
    LEFT JOIN enrollments e ON c.id = e.course_id AND e.student_id = $1
    LEFT JOIN content_progress cp ON e.id = cp.enrollment_id
    ${whereClause}
    GROUP BY c.id, c.category_id, c.teacher_id, cat.name, u.username, u.email
    ORDER BY c.created_at DESC
  `;

  const { rows: courses } = await pool.query(catalogSql, queryParams);

  // Deteksi otomatis kategori aktif saat melakukan pencarian
  let effectiveCategory = selectedCategory;
  if (!effectiveCategory && searchQuery.trim() !== "" && courses.length > 0) {
    const uniqueCats = [...new Set(courses.map((c) => String(c.category_id || "")))];
    if (uniqueCats.length === 1 && uniqueCats[0] !== "") {
      effectiveCategory = uniqueCats[0];
    }
  }

  return (
    <div className="space-y-8">
      {/* Header Banner Catalog */}
      <section className="clay-navy p-7 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <span className="inline-block bg-[#FBE48B] text-[#182338] text-xs font-extrabold px-3.5 py-1 rounded-full">
            Katalog Lengkap Studyo
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
            Eksplorasi Semua Kelas Bahasa
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Pilih program bahasa sesuai targetmu. Daftar kelas, pelajari materi secara
            berurutan, dan pantau persentase progres belajarmu di satu tempat.
          </p>
        </div>

        {/* Form Search */}
        <form action="/courses" method="GET" className="flex w-full md:w-auto gap-2">
          <input
            type="text"
            name="q"
            defaultValue={searchQuery}
            placeholder="Cari kelas bahasa..."
            className="w-full md:w-64 bg-[#233250] border border-[#3B517D] rounded-full px-4 py-2.5 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-[#FBE48B]"
          />
          <button
            type="submit"
            className="clay-yellow px-5 py-2.5 text-xs sm:text-sm font-extrabold cursor-pointer"
          >
            Cari
          </button>
        </form>
      </section>

      {/* Filter Pills Kategori */}
      <div className="flex flex-wrap items-center gap-2.5">
        <Link
          href={searchQuery ? `/courses?q=${encodeURIComponent(searchQuery)}` : "/courses"}
          className={`px-4 py-2 text-xs font-bold transition clay-pill ${
            effectiveCategory === ""
              ? "bg-[#182338] text-[#FBE48B]"
              : "bg-white text-[#182338] hover:bg-[#FBE48B]/50"
          }`}
        >
          Semua Kategori ({courses.length})
        </Link>

        {categories.map((cat) => {
          const isSelected = String(cat.id) === String(effectiveCategory);
          const params = new URLSearchParams();
          if (searchQuery) params.set("q", searchQuery);
          params.set("category", cat.id);

          return (
            <Link
              key={cat.id}
              href={`/courses?${params.toString()}`}
              className={`px-4 py-2 text-xs font-bold transition clay-pill ${
                isSelected
                  ? "bg-[#182338] text-[#FBE48B]"
                  : "bg-white text-[#182338] hover:bg-[#FBE48B]/50"
              }`}
            >
              {cat.name}
            </Link>
          );
        })}
      </div>

      {/* Grid Kartu Course Pintar */}
      {courses.length === 0 ? (
        <div className="clay-card p-12 text-center space-y-3">
          <h2 className="text-xl font-extrabold text-[#182338]">
            Belum ada kelas yang sesuai
          </h2>
          <p className="text-sm text-[#5A657A]">
            Coba gunakan kata kunci lain atau tampilkan semua kategori bahasa.
          </p>
          <Link
            href="/courses"
            className="inline-block clay-yellow px-5 py-2.5 text-xs font-extrabold mt-2"
          >
            Tampilkan Semua Kelas
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const isStudent = !user || user.role === "student";
            const isEnrolled = Boolean(course.enrollment_id);
            const isOwnerOrAdmin =
              user &&
              (user.role === "admin" ||
                (user.role === "teacher" && course.teacher_id === user.id));

            const progressPercent =
              course.total_materials > 0
                ? Math.round((course.completed_materials / course.total_materials) * 100)
                : 0;

            return (
              <article
                key={course.id}
                className="clay-card p-6 flex flex-col justify-between gap-5"
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="bg-[#FBE48B] text-[#182338] text-xs font-extrabold px-3 py-1 rounded-full">
                      {course.category_name || "Umum"}
                    </span>
                    <span className="text-[11px] font-bold text-[#5A657A] bg-[#FAF8F2] px-3 py-1 rounded-full border border-[#EAE4D7]">
                      {formatSchedule(course.start_date, course.end_date)}
                    </span>
                  </div>

                  <Link href={`/courses/${course.id}`} className="block group">
                    <h2 className="text-lg font-extrabold text-[#182338] group-hover:text-[#334B77] transition leading-snug">
                      {course.title}
                    </h2>
                  </Link>

                  <p className="text-sm text-[#5A657A] line-clamp-3 leading-relaxed">
                    {course.description}
                  </p>

                  <div className="pt-2 flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-[#182338]">
                      Pengajar: {course.teacher_name}
                    </span>
                    <a
                      href={`mailto:${course.teacher_email}?subject=${encodeURIComponent(
                        `Tanya Kelas Studyo: ${course.title}`
                      )}`}
                      className="text-[#182338] bg-[#FAF8F2] hover:bg-[#FBE48B] border border-[#E2D9C5] font-bold px-3 py-1 rounded-full transition"
                    >
                      Hubungi Teacher
                    </a>
                  </div>
                </div>

                {/* Bagian Bawah Dinamis Berdasarkan Role */}
                <div className="pt-4 border-t border-[#EFECE4] space-y-3">
                  {!isStudent ? (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#5A657A]">
                        {course.total_materials} Materi
                      </span>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/courses/${course.id}`}
                          className="px-3.5 py-2 rounded-full text-xs font-bold bg-[#FAF8F2] hover:bg-[#EFECE4] text-[#182338] transition"
                        >
                          Detail
                        </Link>
                        {isOwnerOrAdmin && (
                          <Link
                            href={`/courses/${course.id}/learn`}
                            className="bg-[#182338] hover:bg-[#263757] text-[#FBE48B] text-xs font-extrabold px-4 py-2 rounded-full transition"
                          >
                            Forum Diskusi
                          </Link>
                        )}
                      </div>
                    </div>
                  ) : isEnrolled ? (
                    <>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-[#5A657A]">
                            Progres ({course.completed_materials}/{course.total_materials} materi)
                          </span>
                          <span className="text-[#182338]">{progressPercent}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-[#EFECE4] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#182338] rounded-full transition-all duration-300"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/courses/${course.id}/learn`}
                          className="flex-1 text-center clay-yellow py-2.5 px-4 text-xs font-extrabold"
                        >
                          Lanjutkan Belajar &rarr;
                        </Link>
                        <Link
                          href={`/courses/${course.id}`}
                          className="px-3.5 py-2.5 rounded-full text-xs font-bold bg-[#FAF8F2] hover:bg-[#EFECE4] text-[#182338] transition"
                        >
                          Detail
                        </Link>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#5A657A]">
                        {course.total_materials} Materi Tersedia
                      </span>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/courses/${course.id}`}
                          className="px-3.5 py-2.5 rounded-full text-xs font-bold bg-[#FAF8F2] hover:bg-[#EFECE4] text-[#182338] transition"
                        >
                          Detail
                        </Link>

                        {user ? (
                          <form action={enrollCourse}>
                            <input type="hidden" name="course_id" value={course.id} />
                            <button
                              type="submit"
                              className="bg-[#182338] hover:bg-[#263757] text-[#FBE48B] text-xs font-extrabold px-4 py-2.5 rounded-full transition cursor-pointer"
                            >
                              Ikuti Course
                            </button>
                          </form>
                        ) : (
                          <Link
                            href="/login"
                            className="bg-[#182338] hover:bg-[#263757] text-[#FBE48B] text-xs font-extrabold px-4 py-2.5 rounded-full transition"
                          >
                            Ikuti Course
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}