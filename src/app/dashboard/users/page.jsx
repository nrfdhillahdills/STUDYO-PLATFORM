import Link from "next/link";
import { redirect } from "next/navigation";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { createUserByAdmin, approveTeacher, deleteUserByAdmin } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({ searchParams }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/dashboard");

  const resolvedSearch = await searchParams;
  const currentPage = Math.max(1, Number(resolvedSearch?.page) || 1);
  const perPage = 8;
  const offset = (currentPage - 1) * perPage;

  const successMsg = resolvedSearch?.success || "";
  const errorMsg = resolvedSearch?.error || "";

  // Hitung total user untuk pagination
  const { rows: countRows } = await pool.query("SELECT COUNT(*)::int AS total FROM users");
  const totalUsers = countRows[0].total;
  const totalPages = Math.max(1, Math.ceil(totalUsers / perPage));

  // Ambil daftar user (utamakan yang status teacher_status = 'pending' di bagian atas agar mudah dilihat Admin)
  const { rows: users } = await pool.query(
    `SELECT id, username, email, role, teacher_status, approved_at, created_at
     FROM users
     ORDER BY (CASE WHEN teacher_status = 'pending' THEN 0 ELSE 1 END), id DESC
     LIMIT $1 OFFSET $2`,
    [perPage, offset]
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

      {/* Form Create User (Admin) */}
      <section className="clay-card p-6 space-y-4">
        <div>
          <h2 className="text-lg font-extrabold text-[#182338]">Tambah Pengguna Baru</h2>
          <p className="text-xs text-[#5A657A]">
            Admin dapat membuat akun baru secara langsung dengan peran Admin, Teacher, atau Student.
          </p>
        </div>

        <form action={createUserByAdmin} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <input
            type="text"
            name="username"
            placeholder="Username"
            required
            className="bg-[#FAF8F2] border-2 border-[#E6E0D2] rounded-2xl px-4 py-2.5 text-sm"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            className="bg-[#FAF8F2] border-2 border-[#E6E0D2] rounded-2xl px-4 py-2.5 text-sm"
          />
          <input
            type="password"
            name="password"
            placeholder="Password (min. 6)"
            minLength={6}
            required
            className="bg-[#FAF8F2] border-2 border-[#E6E0D2] rounded-2xl px-4 py-2.5 text-sm"
          />
          <select
            name="role"
            defaultValue="student"
            className="bg-[#FAF8F2] border-2 border-[#E6E0D2] rounded-2xl px-4 py-2.5 text-sm font-semibold"
          >
            <option value="student">Role: Student</option>
            <option value="teacher">Role: Teacher</option>
            <option value="admin">Role: Admin</option>
          </select>
          <button
            type="submit"
            className="clay-yellow py-2.5 px-4 text-xs sm:text-sm font-extrabold cursor-pointer"
          >
            + Buat Akun
          </button>
        </form>
      </section>

      {/* Tabel Daftar Pengguna & Verifikasi Teacher Pending */}
      <section className="clay-card p-6 space-y-4 overflow-x-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-[#182338]">
            Daftar Pengguna ({totalUsers})
          </h2>
          <span className="text-xs font-bold text-[#5A657A]">
            Halaman {currentPage} dari {totalPages}
          </span>
        </div>

        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-[#EFECE4] text-xs text-[#5A657A]">
              <th className="py-3 pr-4">Username</th>
              <th className="py-3 pr-4">Email</th>
              <th className="py-3 pr-4">Role</th>
              <th className="py-3 pr-4">Status Pengajar</th>
              <th className="py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isPending = u.role === "student" && u.teacher_status === "pending";
              return (
                <tr
                  key={u.id}
                  className={`border-b border-[#EFECE4] ${
                    isPending ? "bg-[#FBE48B]/20" : ""
                  }`}
                >
                  <td className="py-3.5 pr-4 font-bold text-[#182338]">{u.username}</td>
                  <td className="py-3.5 pr-4 text-xs text-[#5A657A]">{u.email}</td>
                  <td className="py-3.5 pr-4">
                    <span className="px-3 py-1 rounded-full text-[11px] uppercase font-extrabold bg-[#182338] text-[#FBE48B]">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4 text-xs">
                    {isPending ? (
                      <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-extrabold">
                        ⏳ Pending Approval
                      </span>
                    ) : u.role === "teacher" ? (
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold">
                        ✓ Approved Teacher
                      </span>
                    ) : (
                      <span className="text-[#5A657A]">-</span>
                    )}
                  </td>
                  <td className="py-3.5">
                    <div className="flex flex-wrap items-center gap-2">
                      {isPending && (
                        <form action={approveTeacher}>
                          <input type="hidden" name="user_id" value={u.id} />
                          <button
                            type="submit"
                            className="clay-yellow px-3.5 py-1.5 text-xs font-extrabold cursor-pointer"
                          >
                            ✓ Approve Teacher
                          </button>
                        </form>
                      )}

                      <Link
                        href={`/dashboard/users/${u.id}/edit`}
                        className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#FAF8F2] border border-[#E6E0D2] hover:bg-[#182338] hover:text-[#FBE48B] transition"
                      >
                        Edit
                      </Link>

                      {u.id !== user.id && (
                        <form action={deleteUserByAdmin}>
                          <input type="hidden" name="user_id" value={u.id} />
                          <button
                            type="submit"
                            className="px-3 py-1.5 rounded-full text-xs font-bold bg-red-50 text-red-700 hover:bg-red-600 hover:text-white transition cursor-pointer"
                          >
                            Hapus
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Kontrol Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-3">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <Link
                key={pageNum}
                href={`/dashboard/users?page=${pageNum}`}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-extrabold transition ${
                  pageNum === currentPage
                    ? "bg-[#182338] text-[#FBE48B]"
                    : "bg-[#FAF8F2] text-[#182338] hover:bg-[#FBE48B]"
                }`}
              >
                {pageNum}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}