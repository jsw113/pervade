import { prisma } from "@/lib/prisma";

export const FONT_PRESETS: Record<string, string> = {
  Pretendard: "'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif",
  Noto_Sans_KR: "'Noto Sans KR', sans-serif",
  Nanum_Gothic: "'Nanum Gothic', sans-serif",
  Inter: "'Inter', sans-serif",
  Cinzel: "'Cinzel', serif",
  Playfair_Display: "'Playfair Display', serif",
  Montserrat: "'Montserrat', sans-serif",
  Cormorant_Garamond: "'Cormorant Garamond', serif",
  Italiana: "'Italiana', serif",
  MaruBuri: "'MaruBuri', 'Nanum Myeongjo', serif",
};

export async function ThemeStyleInjector() {
  let policies: { key: string; value: string }[] = [];
  try {
    policies = await prisma.policy.findMany({
      where: {
        key: {
          in: [
            "THEME_PRIMARY_COLOR",
            "THEME_ACCENT_COLOR",
            "THEME_BG_COLOR",
            "THEME_BODY_FONT",
            "THEME_HEADING_FONT",
            "THEME_RADIUS",
          ]
        }
      }
    });
  } catch (e) {
    policies = [];
  }

  const getPolicy = (key: string, defaultValue: string) =>
    policies.find((p) => p.key === key)?.value || defaultValue;

  const primaryColor = getPolicy("THEME_PRIMARY_COLOR", "#09090b");
  const accentColor = getPolicy("THEME_ACCENT_COLOR", "#d97706");
  const bgColor = getPolicy("THEME_BG_COLOR", "#ffffff");
  const bodyFontKey = getPolicy("THEME_BODY_FONT", "Pretendard");
  const headingFontKey = getPolicy("THEME_HEADING_FONT", "Pretendard");
  const radius = getPolicy("THEME_RADIUS", "16px");

  const bodyFont = FONT_PRESETS[bodyFontKey] || FONT_PRESETS.Pretendard;
  const headingFont = FONT_PRESETS[headingFontKey] || FONT_PRESETS.Pretendard;

  const css = `
    :root {
      --theme-primary: ${primaryColor};
      --theme-accent: ${accentColor};
      --theme-bg: ${bgColor};
      --theme-radius: ${radius};
      --theme-font-body: ${bodyFont};
      --theme-font-heading: ${headingFont};
    }
    body {
      font-family: var(--theme-font-body);
      background-color: var(--theme-bg);
    }
    h1, h2, h3, .font-heading {
      font-family: var(--theme-font-heading);
    }
  `;

  return (
    <>
      {/* Web Font Imports (Google Fonts CDN with display=swap for high performance) */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;900&family=Cormorant+Garamond:ital,wght@0,500;0,700;1,500&family=Italiana&family=Montserrat:wght@400;600;800&family=Noto+Sans+KR:wght@300;400;500;700;900&family=Playfair+Display:ital,wght@0,600;0,800;1,600&display=swap"
        rel="stylesheet"
      />
      {/* Pretendard WebFont CDN */}
      <link
        rel="stylesheet"
        as="style"
        crossOrigin="anonymous"
        href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-gov.min.css"
      />
      {/* Dynamic Injected CSS Variables */}
      <style dangerouslySetInnerHTML={{ __html: css }} />
    </>
  );
}
