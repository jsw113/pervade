import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Serif_KR } from "next/font/google";
import "./globals.css";
import { SiteLogTracker } from "@/components/common/SiteLogTracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSerifKr = Noto_Serif_KR({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  metadataBase: new URL("https://www.pervade.co.kr"),
  title: {
    default: "퍼베이드 (PERVADE) | 프리미엄 다목적 홈케어",
    template: "%s | PERVADE",
  },
  description: "일상의 공간을 완벽하게 케어하는 프리미엄 다목적 세정제 퍼베이드. 강력한 세정력과 안전한 성분, 감각적인 공간 케어 노하우를 만나보세요.",
  keywords: [
    "퍼베이드",
    "PERVADE",
    "다목적 세정제",
    "올인원 클리너",
    "주방 세정제",
    "욕실 세정제",
    "기름때 제거",
    "물때 제거",
    "홈케어",
    "친환경 세정제",
    "청소 꿀팁",
    "공간 케어",
  ],
  authors: [{ name: "PERVADE" }],
  creator: "PERVADE",
  publisher: "PERVADE",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://www.pervade.co.kr",
    siteName: "PERVADE (퍼베이드)",
    title: "퍼베이드 (PERVADE) | 프리미엄 다목적 홈케어",
    description: "일상의 공간을 완벽하게 케어하는 프리미엄 다목적 세정제 퍼베이드. 강력한 분해력과 감각적인 청소 노하우를 만나보세요.",
    images: [
      {
        url: "/uploads/logo_1786948363468.JPG",
        width: 1200,
        height: 630,
        alt: "PERVADE Premium Homecare",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "퍼베이드 (PERVADE) | 프리미엄 다목적 홈케어",
    description: "일상의 공간을 완벽하게 케어하는 프리미엄 다목적 세정제 퍼베이드",
    images: ["/uploads/logo_1786948363468.JPG"],
  },
  alternates: {
    canonical: "https://www.pervade.co.kr",
    types: {
      "application/rss+xml": "https://www.pervade.co.kr/rss.xml",
    },
  },
  verification: {
    other: {
      "naver-site-verification": ["582f732ad98db9b357028c7d6e1047cc4326bcf5"],
    },
    google: "2hopz_VI0amSopbjK2ngbWeXA3lJ-OzXpVlOVZPtGCw",
  },
};

import { ThemeStyleInjector } from "@/components/common/ThemeStyleInjector";
import { prisma } from "@/lib/prisma";

import { AppShell } from "@/components/layout/AppShell";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Fetch initial theme & logo policies from DB for instant zero-flicker SSR rendering
  let policies: { key: string; value: string }[] = [];
  try {
    policies = await prisma.policy.findMany({
      where: {
        key: {
          in: [
            "LOGO_URL",
            "LOGO_FONT",
            "TOP_BANNER_TEXT",
            "TOP_BANNER_MESSAGES",
            "TOP_BANNER_ENABLED",
            "TOP_BANNER_FONT_SIZE",
            "TOP_BANNER_FONT_WEIGHT",
            "TOP_BANNER_TEXT_COLOR",
            "TOP_BANNER_BG_COLOR",
            "TOP_BANNER_SPEED"
          ]
        }
      }
    });
  } catch (e) {
    policies = [];
  }

  const getPolicy = (key: string, defaultValue: string) =>
    policies.find((p) => p.key === key)?.value || defaultValue;

  const initialLogoUrl = getPolicy("LOGO_URL", "");
  const initialLogoFont = getPolicy("LOGO_FONT", "'Inter', sans-serif");
  const initialTopBannerText = getPolicy("TOP_BANNER_TEXT", "신규 가입 시 3,000P 적립 & 첫 구매 무료배송");
  const rawBannerMessages = getPolicy("TOP_BANNER_MESSAGES", "");
  let initialTopBannerMessages: string[] = [
    "신규 가입 시 3,000P 적립 & 첫 구매 무료배송",
    "우수회원 5% 포인트 적립"
  ];
  if (rawBannerMessages) {
    try {
      const parsed = JSON.parse(rawBannerMessages);
      if (Array.isArray(parsed) && parsed.length > 0) {
        initialTopBannerMessages = parsed;
      }
    } catch (e) {}
  }

  const initialTopBannerEnabled = getPolicy("TOP_BANNER_ENABLED", "true") !== "false";
  const initialTopBannerFontSize = getPolicy("TOP_BANNER_FONT_SIZE", "13px");
  const initialTopBannerFontWeight = getPolicy("TOP_BANNER_FONT_WEIGHT", "500");
  const initialTopBannerTextColor = getPolicy("TOP_BANNER_TEXT_COLOR", "#292524");
  const initialTopBannerBgColor = getPolicy("TOP_BANNER_BG_COLOR", "#F6F4EE");
  const initialTopBannerSpeed = parseInt(getPolicy("TOP_BANNER_SPEED", "3500"), 10) || 3500;

  // Schema.org Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "PERVADE",
    url: "https://www.pervade.co.kr",
    logo: initialLogoUrl ? `https://www.pervade.co.kr${initialLogoUrl}` : "https://www.pervade.co.kr/uploads/logo_1786948363468.JPG",
    description: "프리미엄 다목적 가정용 세정제 퍼베이드 공식 스토어 및 라이프스타일 저널",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      areaServed: "KR",
      availableLanguage: "Korean",
    },
  };

  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} ${notoSerifKr.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <meta name="naver-site-verification" content="582f732ad98db9b357028c7d6e1047cc4326bcf5" />
        <meta name="google-site-verification" content="2hopz_VI0amSopbjK2ngbWeXA3lJ-OzXpVlOVZPtGCw" />
        <ThemeStyleInjector />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
        <SiteLogTracker />
        <AppShell
          initialLogoUrl={initialLogoUrl || null}
          initialLogoFont={initialLogoFont}
          initialTopBannerText={initialTopBannerText}
          initialTopBannerMessages={initialTopBannerMessages}
          initialTopBannerEnabled={initialTopBannerEnabled}
          initialTopBannerFontSize={initialTopBannerFontSize}
          initialTopBannerFontWeight={initialTopBannerFontWeight}
          initialTopBannerTextColor={initialTopBannerTextColor}
          initialTopBannerBgColor={initialTopBannerBgColor}
          initialTopBannerSpeed={initialTopBannerSpeed}
        >
          {children}
        </AppShell>
      </body>
    </html>
  );
}
