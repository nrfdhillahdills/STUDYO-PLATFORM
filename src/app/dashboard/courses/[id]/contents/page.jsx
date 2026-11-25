import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import RichTextEditor from "@/components/RichTextEditor";
import { createContent, deleteContent } from "./actions";

export const dynamic = "force-dynamic";

export default async function ManageContentsPage({ params, searchParams }) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "teacher")) {
    redirect("/dashboard");
  }

  const { id } = await params;
  if (!Number.isInteger(Number(id))) notFound();

  const resolvedSearch = await searchParams;
  const successMsg = resolvedSearch?.success || "";
  const errorMsg = resolvedSearch?.error || "";

  const { rows: courseRows } = await pool.query(
    "SELECT id, title, teacher_id FROM courses WHERE id = $1",
    [Number(id)]
  );
  const course = courseRows[0];
  if (!course) notFound();

  if (user.role === "teacher" && course.teacher_id !== user.id) {
    redirect("/dashboard/courses");
  }

  const { rows: contents } = await pool.query(
    "SELECT id, title, body, order_index, created_at FROM contents WHERE course_id = $1 ORDER BY order_index ASC",
    [course.id]
  );

  const nextOrderIndex =
    contents.length > 0 ? Math.max(...contents.map((c) => c.order_index)) + 1 : 1;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/courses" className="text-xs font-bold text-[#5A657A] hover:underline">
          &larr; Kembali ke Daftar Kelas
        </Link>
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#182338] mt-1">
          Kelola Materi: {course.title}
        </h2>
      </div>

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

      {/* FORM CREATE CONTENT DENGAN RICH TEXT EDITOR */}
      <section className="clay-card p-6 sm:p-8 space-y-4">
        <div>
          <h3 className="text-lg font-extrabold text-[#182338]">Tambah Materi Pembelajaran Baru</h3>
          <p className="text-xs text-[#5A657A]">
            Gunakan Rich Text Editor untuk memformat teks tebal, miring, heading, daftar angka, gambar, atau tabel kosakata.
          </p>
        </div>

        <form action={createContent} className="space-y-4">
          <input type="hidden" name="course_id" value={course.id} />

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-3">
              <label className="block text-xs font-extrabold mb-1.5">Judul Materi *</label>
              <input
                type="text"
                name="title"
                placeholder="Contoh: Bab 1 - Pengenalan Huruf Hangul & Vokal Dasar"
                required
                className="w-full bg-[#FAF8F2] border-2 border-[#E6E0D2] rounded-2xl px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold mb-1.5">Urutan (Order Index) *</label>
              <input
                type="number"
                name="order_index"
                min="1"
                defaultValue={nextOrderIndex}
                required
                className="w-full bg-[#FAF8F2] border-2 border-[#E6E0D2] rounded-2xl px-4 py-2.5 text-sm font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold mb-1.5">Isi Materi Pembelajaran *</label>
            <RichTextEditor name="body" defaultValue="<p>Tulis penjelasan materi bahasa di sini...</p>" />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="clay-yellow px-6 py-2.5 text-xs sm:text-sm font-extrabold cursor-pointer"
            >
              + Tambahkan Materi
            </button>
          </div>
        </form>
      </section>

      {/* DAFTAR MATERI BERURUTAN */}
      <section className="clay-card p-6 space-y-4">
        <h3 className="text-lg font-extrabold text-[#182338]">
          Daftar Materi Tersusun ({contents.length})
        </h3>

        {contents.length === 0 ? (
          <p className="text-xs text-[#5A657A]">
            Belum ada materi di kelas ini. Tambahkan materi pertama di atas.
          </p>
        ) : (
          <div className="space-y-3">
            {contents.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#FAF8F2] border border-[#EAE4D7]"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#182338] text-[#FBE48B] flex items-center justify-center text-xs font-extrabold shrink-0">
                    #{item.order_index}
                  </span>
                  <div>
                    <p className="text-sm font-extrabold text-[#182338]">{item.title}</p>
                    <p className="text-[11px] text-[#5A657A]">
                      Urutan ke-{item.order_index}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/courses/${course.id}/contents/${item.id}/edit`}
                    className="px-4 py-1.5 rounded-full text-xs font-bold bg-white border border-[#E6E0D2] hover:bg-[#182338] hover:text-[#FBE48B] transition"
                  >
                    Edit Materi
                  </Link>

                  <form action={deleteContent}>
                    <input type="hidden" name="course_id" value={course.id} />
                    <input type="hidden" name="content_id" value={item.id} />
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-red-50 text-red-700 hover:bg-red-600 hover:text-white transition cursor-pointer"
                    >
                      Hapus
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}