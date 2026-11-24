import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "Studyo | Platform Kursus Bahasa Interaktif",
  description:
    "Belajar bahasa asing dengan materi terstruktur, pelacakan progres, dan sertifikat kelulusan.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={`${plusJakarta.className} min-h-screen flex flex-col bg-[#FAF8F2] text-[#182338]`}>
        <Navbar />
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}