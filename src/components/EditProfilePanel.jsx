"use client";

import { useState } from "react";
import { updateOwnProfile } from "@/app/profile/actions";

export default function EditProfilePanel({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [preview, setPreview] = useState(user.avatar_url || "");

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-5 py-3 rounded-full text-xs sm:text-sm font-extrabold bg-white text-[#182338] hover:bg-[#FBE48B] transition cursor-pointer shadow-sm"
      >
        {isOpen ? "Tutup Edit Profil ✕" : "Edit Profil & Foto ✎"}
      </button>

      {isOpen && (
        <div className="clay-card p-6 sm:p-8 text-[#182338] mt-4">
          <h3 className="text-lg font-extrabold mb-1">Pengaturan Profil Saya</h3>
          <p className="text-xs text-[#5A657A] mb-5">
            Ubah nama tampilan, foto profil (JPG/PNG/WebP maks. 2MB), atau perbarui password.
          </p>

          <form action={updateOwnProfile} className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-20 h-20 rounded-[24px] overflow-hidden bg-[#FBE48B] text-[#182338] flex items-center justify-center text-2xl font-black shrink-0 border-2 border-[#E6E0D2]">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user.username.charAt(0).toUpperCase()
                )}
              </div>

              <div className="space-y-1.5 flex-1">
                <label className="block text-xs font-extrabold text-[#182338]">
                  Upload Foto Profil Baru
                </label>
                <input
                  type="file"
                  name="avatar"
                  accept="image/png, image/jpeg, image/webp, image/gif"
                  onChange={handleFileChange}
                  className="block w-full text-xs text-[#5A657A] file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-extrabold file:bg-[#182338] file:text-[#FBE48B] hover:file:bg-[#263757] cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold mb-1.5">
                  Nama Lengkap / Username
                </label>
                <input
                  type="text"
                  name="username"
                  defaultValue={user.username}
                  required
                  className="w-full bg-[#FAF8F2] border-2 border-[#E6E0D2] rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#182338]"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold mb-1.5">
                  Password Baru (Kosongkan jika tetap)
                </label>
                <input
                  type="password"
                  name="password"
                  minLength={6}
                  placeholder="Minimal 6 karakter"
                  className="w-full bg-[#FAF8F2] border-2 border-[#E6E0D2] rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#182338]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="clay-yellow px-6 py-2.5 text-xs sm:text-sm font-extrabold cursor-pointer"
              >
                Simpan Perubahan Profil
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}