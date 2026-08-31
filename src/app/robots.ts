import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.pervade.co.kr";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/api/*",
          "/checkout",
          "/mypage",
          "/cart",
        ],
      },
      {
        userAgent: "Yeti", // Naver Search Engine Bot
        allow: "/",
        disallow: ["/admin/*", "/api/*"],
      },
      {
        userAgent: "Googlebot", // Google Search Engine Bot
        allow: "/",
        disallow: ["/admin/*", "/api/*"],
      },
      {
        userAgent: "Daumoa", // Daum / Kakao Search Engine Bot
        allow: "/",
        disallow: ["/admin/*", "/api/*"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
