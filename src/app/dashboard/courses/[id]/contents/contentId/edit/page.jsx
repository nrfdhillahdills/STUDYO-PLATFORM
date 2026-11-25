import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import RichTextEditor from "@/components/RichTextEditor";
import { updateContent } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditContentPage({ params }) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "teacher")) {
    redirect("/dashboard");
  }

  const { id, contentId } = await params;
  if (!Number.isInteger(Number(id)) || !Number.isInteger(Number(contentId))) {
    notFound();
  }

  const { rows: courseRows } = await pool.query(
    "SELECT id, title, teacher_id FROM courses WHERE id = $1",
    [Number(id)]
  );
  const course = courseRows[0];
  if (!course) notFound();

  if (user.role === "teacher" && course.teacher_id !== user.id) {
    redirect("/dashboard/courses");
  }

  const { rows: contentRows } = await pool.query(
    "SELECT id, title, body, order_index FROM contents WHERE id = $1 AND course_id = $2",
    [Number(contentId), course.id]
  );
  const content = contentRows[0];
  if (!content) notFound();

  return (
    <div className="max-w-3xl mx-auto clay-card p-6 sm:p-8 space-y-5">
      <div>
        <Link
          href={`/dashboard/courses/${course.id}/contents`}
          className="text-xs font-bold text-[#5A657A] hover:underline"
        >
          &larr; Kembali ke Daftar Materi
        </Link>
        <h2 className="text-xl font-extrabold text-[#182338] mt-2">
          Edit Materi: {content.title}
        </h2>
      </div>

      <form action={updateContent} className="space-y-4">
        <input type="hidden" name="course_id" value={course.id} />
        <input type="hidden" name="content_id" value={content.id} />

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="sm:col-span-3">
            <label className="block text-xs font-extrabold mb-1.5">Judul Materi *</label>
            <input
              type="text"
              name="title"
              defaultValue={content.title}
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
              defaultValue={content.order_index}
              required
              className="w-full bg-[#FAF8F2] border-2 border-[#E6E0D2] rounded-2xl px-4 py-2.5 text-sm font-bold"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-extrabold mb-1.5">Isi Materi Pembelajaran *</label>
          <RichTextEditor name="body" defaultValue={content.body} />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="clay-yellow px-6 py-2.5 text-xs sm:text-sm font-extrabold cursor-pointer"
          >
            Simpan Perubahan Materi
          </button>
          <Link
            href={`/dashboard/courses/${course.id}/contents`}
            className="px-4 py-2.5 text-xs font-bold text-[#5A657A] hover:underline"
          >
            Batal
          </Link>
        </div>
      </form>
    </div>
  );
}