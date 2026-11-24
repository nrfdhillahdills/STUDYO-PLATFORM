"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 rounded-full text-xs font-bold bg-[#273757] hover:bg-red-500/90 text-white transition cursor-pointer"
    >
      Keluar
    </button>
  );
}