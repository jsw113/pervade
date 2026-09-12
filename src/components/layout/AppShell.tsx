"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingKakaoChat } from "@/components/common/FloatingKakaoChat";

interface AppShellProps {
  initialLogoUrl?: string | null;
  initialLogoFont?: string;
  initialTopBannerText?: string;
  initialTopBannerMessages?: string[];
  initialTopBannerEnabled?: boolean;
  initialTopBannerFontSize?: string;
  initialTopBannerFontWeight?: string;
  initialTopBannerTextColor?: string;
  initialTopBannerBgColor?: string;
  initialTopBannerSpeed?: number;
  children: React.ReactNode;
}

export function AppShell({
  initialLogoUrl,
  initialLogoFont,
  initialTopBannerText,
  initialTopBannerMessages,
  initialTopBannerEnabled,
  initialTopBannerFontSize,
  initialTopBannerFontWeight,
  initialTopBannerTextColor,
  initialTopBannerBgColor,
  initialTopBannerSpeed,
  children,
}: AppShellProps) {
  const pathname = usePathname();
  const isEditorial = pathname === "/editorial-preview" || pathname?.startsWith("/editorial-preview/");
  const isAdmin = pathname?.startsWith("/admin");

  if (isEditorial) {
    return <>{children}</>;
  }

  return (
    <>
      {!isAdmin && (
        <Navbar
          initialLogoUrl={initialLogoUrl}
          initialLogoFont={initialLogoFont}
          initialTopBannerText={initialTopBannerText}
          initialTopBannerMessages={initialTopBannerMessages}
          initialTopBannerEnabled={initialTopBannerEnabled}
          initialTopBannerFontSize={initialTopBannerFontSize}
          initialTopBannerFontWeight={initialTopBannerFontWeight}
          initialTopBannerTextColor={initialTopBannerTextColor}
          initialTopBannerBgColor={initialTopBannerBgColor}
          initialTopBannerSpeed={initialTopBannerSpeed}
        />
      )}
      <main className="flex-1 bg-white">{children}</main>
      {!isAdmin && <Footer />}
      {!isAdmin && <FloatingKakaoChat />}
    </>
  );
}
