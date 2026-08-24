"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function SiteLogTracker() {
  const pathname = usePathname();
  const lastTrackedPath = useRef<string>("");

  useEffect(() => {
    // Avoid duplicate logging on identical path in same session
    if (pathname === lastTrackedPath.current) return;
    lastTrackedPath.current = pathname;

    // Ignore admin pages
    if (pathname.startsWith("/admin") || pathname.startsWith("/api")) return;

    try {
      // 1. Detect Device
      const ua = navigator.userAgent || "";
      let device = "Desktop";
      if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) {
        device = /iPad|Tablet/i.test(ua) ? "Tablet" : "Mobile";
      }

      // 2. Detect Browser
      let browser = "Chrome";
      if (ua.includes("Whale/")) browser = "Naver Whale";
      else if (ua.includes("KAKAOTALK")) browser = "Kakao In-App";
      else if (ua.includes("Instagram")) browser = "Instagram In-App";
      else if (ua.includes("SamsungBrowser/")) browser = "Samsung Internet";
      else if (ua.includes("Edg/")) browser = "Microsoft Edge";
      else if (ua.includes("Safari/") && !ua.includes("Chrome/")) browser = "Apple Safari";
      else if (ua.includes("Firefox/")) browser = "Mozilla Firefox";

      // 3. Referrer
      const referrer = document.referrer || "";

      // 4. Non-blocking beacon or fetch
      const payload = JSON.stringify({
        path: pathname,
        referrer,
        device,
        browser,
      });

      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon("/api/analytics/log", blob);
      } else {
        fetch("/api/analytics/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    } catch (e) {
      // Fail silently to never impact user experience
    }
  }, [pathname]);

  return null;
}
