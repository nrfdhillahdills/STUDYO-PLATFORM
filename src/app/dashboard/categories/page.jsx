import { redirect } from "next/navigation";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { createCategory, updateCategory, deleteCategory } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage({ searchParams }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/dashboard");

  const resolvedSearch = await searchParams;
  const successMsg = resolvedSearch?.success || "";
  const errorMsg = resolvedSearch?.error || "";

  const { rows: categories } = await pool.query(
    `SELECT cat.id, cat.name, COUNT(c.id)::int AS total_courses
     FROM categories cat
     LEFT JOIN courses c ON cat.id = c.category_id
     GROUP BY cat.id, cat.name
     ORDER BY cat.id ASC`
  );

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

      {/* Form Tambah Kategori */}
      <section className="clay-card p-6 space-y-4">
        <div>
          <h2 className="text-lg font-extrabold text-[#182338]">Tambah Kategori Bahasa</h2>
          <p className="text-xs text-[#5A657A]">
            Kategori ini otomatis tampil sebagai dropdown saat pembuatan kelas dan filter di beranda.
          </p>
        </div>

        <form action={createCategory} className="flex flex-col sm:flex-row gap-3 max-w-xl">
          <input
            type="text"
            name="name"
            placeholder="Contoh: Bahasa Mandarin, Bahasa Jerman..."
            required
            className="flex-1 bg-[#FAF8F2] border-2 border-[#E6E0D2] rounded-2xl px-4 py-2.5 text-sm"
          />
          <button
            type="submit"
            className="clay-yellow px-6 py-2.5 text-xs sm:text-sm font-extrabold cursor-pointer"
          >
            + Tambah Kategori
          </button>
        </form>
      </section>

      {/* Daftar & Inline Edit / Delete Kategori */}
      <section className="clay-card p-6 space-y-4">
        <h2 className="text-lg font-extrabold text-[#182338]">
          Daftar Kategori Bahasa ({categories.length})
        </h2>

        <div className="space-y-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#FAF8F2] border border-[#EAE4D7]"
            >
              <form action={updateCategory} className="flex flex-1 items-center gap-2.5">
                <input type="hidden" name="id" value={cat.id} />
                <input
                  type="text"
                  name="name"
                  defaultValue={cat.name}
                  required
                  className="flex-1 bg-white border border-[#DED7C8] rounded-xl px-3.5 py-2 text-sm font-bold text-[#182338]"
                />
                <span className="text-xs text-[#5A657A] shrink-0">
                  ({cat.total_courses} kelas)
                </span>
                <button
                  type="submit"
                  className="bg-[#182338] text-[#FBE48B] text-xs font-extrabold px-4 py-2 rounded-full cursor-pointer"
                >
                  Simpan
                </button>
              </form>

              <form action={deleteCategory}>
                <input type="hidden" name="id" value={cat.id} />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-full text-xs font-bold bg-red-50 text-red-700 hover:bg-red-600 hover:text-white transition cursor-pointer"
                >
                  Hapus
                </button>
              </form>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}