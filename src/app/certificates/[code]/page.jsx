import Link from "next/link";
import { notFound } from "next/navigation";
import pool from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CertificatePage({ params }) {
  const { code } = await params;

  const { rows } = await pool.query(
    `SELECT
      cert.certificate_code,
      cert.issued_at,
      student.username AS student_name,
      c.title AS course_title,
      cat.name AS category_name,
      teacher.username AS teacher_name
     FROM certificates cert
     JOIN enrollments e ON cert.enrollment_id = e.id
     JOIN users student ON e.student_id = student.id
     JOIN courses c ON e.course_id = c.id
     LEFT JOIN categories cat ON c.category_id = cat.id
     LEFT JOIN users teacher ON c.teacher_id = teacher.id
     WHERE cert.certificate_code = $1`,
    [code.toUpperCase()]
  );

  const cert = rows[0];
  if (!cert) notFound();

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4">
      <div className="flex items-center justify-between">
        <Link
          href="/profile"
          className="text-xs font-extrabold text-[#182338] bg-white px-4 py-2 rounded-full border border-[#E6E0D2] hover:bg-[#FBE48B] transition"
        >
          &larr; Kembali ke Profil
        </Link>
        <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3.5 py-1.5 rounded-full">
          ✓ Sertifikat Terverifikasi Resmi
        </span>
      </div>

      {/* Kartu Sertifikat Digital 3D Clay Navy & Soft Yellow */}
      <div className="clay-navy p-8 sm:p-12 border-4 border-[#FBE48B] text-center space-y-6 relative overflow-hidden">
        <div className="inline-flex items-center gap-2 bg-[#FBE48B] text-[#182338] px-4 py-1.5 rounded-full text-xs font-extrabold">
          <span>STUDYO LANGUAGE ACADEMY</span>
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-[#FBE48B] font-bold">
            Certificate of Completion
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Sertifikat Kelulusan Kursus
          </h1>
        </div>

        <p className="text-sm text-slate-300">
          Dengan ini menyatakan bahwa peserta berikut:
        </p>

        <div className="py-2">
          <p className="text-2xl sm:text-4xl font-extrabold text-[#FBE48B] underline decoration-[#FBE48B]/40 underline-offset-8">
            {cert.student_name}
          </p>
        </div>

        <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          Telah menyelesaikan 100% seluruh materi pembelajaran dan evaluasi pada kelas{" "}
          <span className="font-bold text-white">{cert.course_title}</span>{" "}
          ({cert.category_name || "Bahasa"}).
        </p>

        <div className="pt-6 border-t border-[#31446B] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-[#233250] p-3.5 rounded-2xl">
            <p className="text-slate-400">Instruktur Kelas</p>
            <p className="font-extrabold text-white mt-1">{cert.teacher_name}</p>
          </div>

          <div className="bg-[#233250] p-3.5 rounded-2xl">
            <p className="text-slate-400">Tanggal Terbit</p>
            <p className="font-extrabold text-white mt-1">
              {new Date(cert.issued_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="bg-[#233250] p-3.5 rounded-2xl">
            <p className="text-slate-400">Certificate Identifier</p>
            <p className="font-mono font-extrabold text-[#FBE48B] mt-1">
              {cert.certificate_code}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}