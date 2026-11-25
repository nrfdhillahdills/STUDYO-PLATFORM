import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { updateCourse } from "../../actions";

export const dynamic = "force-dynamic";

function toInputDate(dateVal) {
  if (!dateVal) return "";
  return new Date(dateVal).toISOString().split("T")[0];
}

export default async function EditCoursePage({ params }) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "teacher")) {
    redirect("/dashboard");
  }

  const { id } = await params;
  if (!Number.isInteger(Number(id))) notFound();

  const { rows: courseRows } = await pool.query(
    `SELECT c.*, u.username AS teacher_name
     FROM courses c
     LEFT JOIN users u ON c.teacher_id = u.id
     WHERE c.id = $1`,
    [Number(id)]
  );
  const course = courseRows[0];
  if (!course) notFound();

  if (user.role === "teacher" && course.teacher_id !== user.id) {
    redirect("/dashboard/courses");
  }

  const { rows: categories } = await pool.query(
    "SELECT id, name FROM categories ORDER BY name ASC"
  );

  let teachers = [];
  if (user.role === "admin") {
    const { rows: teacherRows } = await pool.query(
      "SELECT id, username, email FROM users WHERE role IN ('teacher', 'admin') ORDER BY username ASC"
    );
    teachers = teacherRows;
  }

  return (
    <div className="max-w-2xl mx-auto clay-card p-6 sm:p-8 space-y-5">
      <div>
        <Link href="/dashboard/courses" className="text-xs font-bold text-[#5A657A] hover:underline">
          &larr; Kembali ke Daftar Kelas
        </Link>
        <h2 className="text-xl font-extrabold text-[#182338] mt-2">
          Edit Kelas: {course.title}
        </h2>
      </div>

      <form action={updateCourse} className="space-y-4">
        <input type="hidden" name="course_id" value={course.id} />

        <div>
          <label className="block text-xs font-extrabold mb-1.5">Nama Course *</label>
          <input
            type="text"
            name="title"
            defaultValue={course.title}
            required
            className="w-full bg-[#FAF8F2] border-2 border-[#E6E0D2] rounded-2xl px-4 py-2.5 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-extrabold mb-1.5">Deskripsi Course *</label>
          <textarea
            name="description"
            rows={4}
            defaultValue={course.description}
            required
            className="w-full bg-[#FAF8F2] border-2 border-[#E6E0D2] rounded-2xl px-4 py-2.5 text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-extrabold mb-1.5">Kategori *</label>
            <select
              name="category_id"
              defaultValue={course.category_id || ""}
              required
              className="w-full bg-[#FAF8F2] border-2 border-[#E6E0D2] rounded-2xl px-4 py-2.5 text-sm font-semibold"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-extrabold mb-1.5">Nama Teacher *</label>
            {user.role === "admin" ? (
              <select
                name="teacher_id"
                defaultValue={course.teacher_id}
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
                value={course.teacher_name}
                readOnly
                className="w-full bg-[#EFECE4] border-2 border-[#E6E0D2] rounded-2xl px-4 py-2.5 text-sm font-bold text-[#5A657A]"
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-extrabold mb-1.5">
              Tanggal Mulai (Kosongkan = Lifetime)
            </label>
            <input
              type="date"
              name="start_date"
              defaultValue={toInputDate(course.start_date)}
              className="w-full bg-[#FAF8F2] border-2 border-[#E6E0D2] rounded-2xl px-4 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold mb-1.5">
              Tanggal Selesai (Kosongkan = Lifetime)
            </label>
            <input
              type="date"
              name="end_date"
              defaultValue={toInputDate(course.end_date)}
              className="w-full bg-[#FAF8F2] border-2 border-[#E6E0D2] rounded-2xl px-4 py-2.5 text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="clay-yellow px-6 py-2.5 text-xs sm:text-sm font-extrabold cursor-pointer"
          >
            Simpan Perubahan
          </button>
          <Link
            href="/dashboard/courses"
            className="px-4 py-2.5 text-xs font-bold text-[#5A657A] hover:underline"
          >
            Batal
          </Link>
        </div>
      </form>
    </div>
  );
}