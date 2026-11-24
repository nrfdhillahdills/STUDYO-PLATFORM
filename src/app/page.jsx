import Link from "next/link";
import pool from "@/lib/db";
import ClayMascot from "@/components/ClayMascot";

export const dynamic = "force-dynamic";

export default async function HomePage({ searchParams }) {
  const resolvedParams = await searchParams;
  const searchQuery = resolvedParams?.q || "";
  const selectedCategory = resolvedParams?.category || "";

  // 1. Ambil semua kategori dari database untuk filter
  const { rows: categories } = await pool.query(
    "SELECT id, name FROM categories ORDER BY name ASC"
  );

  // 2. Query 5 course terpopuler (berdasarkan jumlah student enrolled) + filter pencarian & kategori
  const queryParams = [];
  const conditions = [];

  if (searchQuery.trim() !== "") {
    queryParams.push(`%${searchQuery.trim()}%`);
    conditions.push(`(c.title ILIKE $${queryParams.length} OR c.description ILIKE $${queryParams.length})`);
  }

  if (selectedCategory !== "") {
    queryParams.push(Number(selectedCategory));
    conditions.push(`c.category_id = $${queryParams.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const popularCoursesSql = `
    SELECT 
      c.id,
      c.title,
      c.description,
      c.start_date,
      c.end_date,
      cat.name AS category_name,
      u.username AS teacher_name,
      COUNT(DISTINCT e.id)::int AS total_students,
      COUNT(DISTINCT cnt.id)::int AS total_materials
    FROM courses c
    LEFT JOIN categories cat ON c.category_id = cat.id
    LEFT JOIN users u ON c.teacher_id = u.id
    LEFT JOIN enrollments e ON c.id = e.course_id
    LEFT JOIN contents cnt ON c.id = cnt.course_id
    ${whereClause}
    GROUP BY c.id, cat.name, u.username
    ORDER BY total_students DESC, c.created_at DESC
    LIMIT 5
  `;

  const { rows: popularCourses } = await pool.query(popularCoursesSql, queryParams);

  return (
    <div className="space-y-12">
      {/* HERO SECTION: Navy + Soft Yellow + 3D Matte Clay Cartoon */}
      <section className="clay-navy p-7 sm:p-12 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <span className="inline-flex items-center gap-2 bg-[#263757] border border-[#384E7A] text-[#FBE48B] text-xs font-bold px-4 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-[#FBE48B]" />
              Platform Kursus Bahasa Interaktif
            </span>

            <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight text-white">
              Kuasai Bahasa Baru dengan Cara yang{" "}
              <span className="text-[#FBE48B]">Seru &amp; Terstruktur.</span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base max-w-xl leading-relaxed">
              Dari Hangul dasar hingga persiapan TOEFL profesional. Pelajari materi
              langkah demi langkah, diskusikan langsung dengan pengajar, dan raih
              sertifikat kelulusan resmi di Studyo.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link
                href="/courses"
                className="clay-yellow px-6 py-3.5 text-sm font-extrabold"
              >
                Jelajahi Semua Kelas &rarr;
              </Link>
              <Link
                href="/register"
                className="px-6 py-3.5 rounded-full text-sm font-bold bg-[#253554] hover:bg-[#2F4369] text-white border border-[#3A517D] transition"
              >
                Daftar Jadi Pengajar
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <ClayMascot />
          </div>
        </div>
      </section>

      {/* SEARCH & CATEGORY FILTER SECTION */}
      <section className="clay-card p-6 sm:p-8 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#182338]">
              Temukan Kelas Bahasamu
            </h2>
            <p className="text-sm text-[#5A657A]">
              Cari berdasarkan judul kursus atau filter kategori bahasa di bawah ini.
            </p>
          </div>

          {/* Form Pencarian */}
          <form action="/" method="GET" className="flex w-full md:w-auto gap-2">
            {selectedCategory && (
              <input type="hidden" name="category" value={selectedCategory} />
            )}
            <input
              type="text"
              name="q"
              defaultValue={searchQuery}
              placeholder="Cari bahasa Korea, TOEFL, Inggris..."
              className="w-full md:w-72 bg-[#FAF8F2] border-2 border-[#E6E0D2] rounded-full px-4 py-2.5 text-sm text-[#182338] focus:outline-none focus:border-[#182338]"
            />
            <button
              type="submit"
              className="bg-[#182338] hover:bg-[#263757] text-[#FBE48B] font-bold text-sm px-5 py-2.5 rounded-full transition cursor-pointer"
            >
              Cari
            </button>
          </form>
        </div>

        {/* Filter Kategori (Clay Pills) */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <Link
            href={searchQuery ? `/?q=${encodeURIComponent(searchQuery)}` : "/"}
            className={`px-4 py-2 text-xs font-bold transition clay-pill ${
              selectedCategory === ""
                ? "bg-[#182338] text-[#FBE48B]"
                : "bg-[#FAF8F2] text-[#182338] hover:bg-[#FBE48B]/50"
            }`}
          >
            Semua Bahasa
          </Link>

          {categories.map((cat) => {
            const isSelected = String(cat.id) === String(selectedCategory);
            const params = new URLSearchParams();
            if (searchQuery) params.set("q", searchQuery);
            params.set("category", cat.id);

            return (
              <Link
                key={cat.id}
                href={`/?${params.toString()}`}
                className={`px-4 py-2 text-xs font-bold transition clay-pill ${
                  isSelected
                    ? "bg-[#182338] text-[#FBE48B]"
                    : "bg-[#FAF8F2] text-[#182338] hover:bg-[#FBE48B]/50"
                }`}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>
      </section>

      {/* 5 COURSE TERPOPULER SECTION */}
      <section className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="inline-block bg-[#FBE48B] text-[#182338] text-xs font-extrabold px-3.5 py-1 rounded-full mb-2">
              Top 5 Pilihan Siswa
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#182338]">
              Kursus Bahasa Terpopuler
            </h2>
          </div>

          <Link
            href="/courses"
            className="text-sm font-bold text-[#182338] hover:underline"
          >
            Lihat Semua Katalog &rarr;
          </Link>
        </div>

        {popularCourses.length === 0 ? (
          <div className="clay-card p-10 text-center space-y-3">
            <p className="text-lg font-bold text-[#182338]">
              Kursus tidak ditemukan
            </p>
            <p className="text-sm text-[#5A657A]">
              Coba ubah kata kunci pencarian atau pilih kategori bahasa lainnya.
            </p>
            <Link
              href="/"
              className="inline-block clay-yellow px-5 py-2.5 text-xs font-extrabold mt-2"
            >
              Reset Filter
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularCourses.map((course, idx) => (
              <article
                key={course.id}
                className="clay-card p-6 flex flex-col justify-between gap-5"
              >
                <div className="space-y-3">
                  {/* Header Badge Kategori + Peringkat Populer */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="bg-[#FBE48B] text-[#182338] text-xs font-extrabold px-3 py-1 rounded-full">
                      {course.category_name || "Umum"}
                    </span>
                    <span className="text-xs font-bold text-[#5A657A] bg-[#FAF8F2] px-3 py-1 rounded-full border border-[#EAE4D7]">
                      #{idx + 1} Populer
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-[#182338] leading-snug">
                    {course.title}
                  </h3>

                  <p className="text-sm text-[#5A657A] line-clamp-3 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                <div className="space-y-4 pt-3 border-t border-[#EFECE4]">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#5A657A]">
                    <span>Pengajar: {course.teacher_name}</span>
                    <span>{course.total_materials} Materi</span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-bold text-[#182338]">
                      {course.total_students} Siswa Terdaftar
                    </span>

                    <Link
                      href={`/courses/${course.id}`}
                      className="bg-[#182338] hover:bg-[#263757] text-[#FBE48B] text-xs font-bold px-4 py-2.5 rounded-full transition"
                    >
                      Lihat Detail
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}