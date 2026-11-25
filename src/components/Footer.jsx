export default function Footer() {
  return (
    <footer className="mt-16 px-4 pb-8">
      <div className="max-w-6xl mx-auto border-t border-[#E6E0D2] pt-8 flex flex-col items-center justify-center text-center gap-2.5">
        <div className="flex items-center justify-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-[#182338] text-[#FBE48B] flex items-center justify-center font-black shadow-xs">
            S
          </span>
          <p className="text-base font-extrabold text-[#182338]">
            Stud<span className="text-[#D4A72C]">yo</span> Language Learning
          </p>
        </div>

        <p className="text-xs font-medium text-[#5A657A]">
          Platform Kursus Bahasa Interaktif • Pemrograman Web 2026
        </p>
      </div>
    </footer>
  );
}