import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SiteLogTracker } from "@/components/common/SiteLogTracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
        url: "/uploads/hero_bg_1786971398395.JPG",
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
    images: ["/uploads/hero_bg_1786971398395.JPG"],
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
import { FloatingKakaoChat } from "@/components/common/FloatingKakaoChat";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Schema.org Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "PERVADE",
    url: "https://www.pervade.co.kr",
    logo: "https://www.pervade.co.kr/uploads/hero_bg_1786971398395.JPG",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
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
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <FloatingKakaoChat />
      </body>
    </html>
  );
}
