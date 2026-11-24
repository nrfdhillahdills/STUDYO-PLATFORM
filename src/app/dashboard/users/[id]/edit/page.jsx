import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { updateUserByAdmin } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditUserPage({ params }) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "admin") redirect("/dashboard");

  const { id } = await params;
  if (!Number.isInteger(Number(id))) notFound();

  const { rows } = await pool.query(
    "SELECT id, username, email, role, teacher_status FROM users WHERE id = $1",
    [Number(id)]
  );
  const targetUser = rows[0];
  if (!targetUser) notFound();

  return (
    <div className="max-w-lg mx-auto clay-card p-6 sm:p-8 space-y-5">
      <div>
        <Link href="/dashboard/users" className="text-xs font-bold text-[#5A657A] hover:underline">
          &larr; Kembali ke Daftar User
        </Link>
        <h2 className="text-xl font-extrabold text-[#182338] mt-2">
          Edit Pengguna #{targetUser.id}
        </h2>
      </div>

      <form action={updateUserByAdmin} className="space-y-4">
        <input type="hidden" name="user_id" value={targetUser.id} />

        <div>
          <label className="block text-xs font-extrabold mb-1.5">Username</label>
          <input
            type="text"
            name="username"
            defaultValue={targetUser.username}
            required
            className="w-full bg-[#FAF8F2] border-2 border-[#E6E0D2] rounded-2xl px-4 py-2.5 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-extrabold mb-1.5">Email</label>
          <input
            type="email"
            name="email"
            defaultValue={targetUser.email}
            required
            className="w-full bg-[#FAF8F2] border-2 border-[#E6E0D2] rounded-2xl px-4 py-2.5 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-extrabold mb-1.5">
            Password Baru (Kosongkan jika tidak diubah)
          </label>
          <input
            type="password"
            name="password"
            minLength={6}
            placeholder="Minimal 6 karakter"
            className="w-full bg-[#FAF8F2] border-2 border-[#E6E0D2] rounded-2xl px-4 py-2.5 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-extrabold mb-1.5">Role Akun</label>
          <select
            name="role"
            defaultValue={targetUser.role}
            className="w-full bg-[#FAF8F2] border-2 border-[#E6E0D2] rounded-2xl px-4 py-2.5 text-sm font-semibold"
          >
            <option value="student">student</option>
            <option value="teacher">teacher (Otomatis Approved)</option>
            <option value="admin">admin</option>
          </select>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="clay-yellow px-6 py-2.5 text-xs sm:text-sm font-extrabold cursor-pointer"
          >
            Simpan Perubahan
          </button>
          <Link
            href="/dashboard/users"
            className="px-4 py-2.5 text-xs font-bold text-[#5A657A] hover:underline"
          >
            Batal
          </Link>
        </div>
      </form>
    </div>
  );
}