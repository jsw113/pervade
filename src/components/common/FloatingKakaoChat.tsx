"use client";

import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";

export function FloatingKakaoChat() {
  const pathname = usePathname();

  // Hide floating chat button inside admin console
  if (pathname && pathname.startsWith("/admin")) {
    return null;
  }

  const kakaoChatUrl = "https://pf.kakao.com/@pervade/chat";

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center group">
      <a
        href={kakaoChatUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="카카오톡 1:1 실시간 상담 문의"
        className="flex items-center gap-2.5 px-4 py-3 bg-[#FEE500] hover:bg-[#FDD835] text-[#191919] font-bold text-xs rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 border border-[#E5CE00]/40 cursor-pointer"
      >
        {/* Kakao Talk Speech Bubble Icon */}
        <svg
          className="w-5 h-5 fill-current"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 3C6.477 3 2 6.477 2 10.765c0 2.76 1.84 5.18 4.63 6.55-.2.74-.74 2.72-.85 3.15-.14.54.2.53.42.39.18-.11 2.82-1.92 3.96-2.7.6.08 1.21.13 1.84.13 5.523 0 10-3.477 10-7.765C22 6.477 17.523 3 12 3z" />
        </svg>
        <span className="hidden sm:inline font-extrabold tracking-tight">카톡 1:1 상담</span>
      </a>
    </div>
  );
}
