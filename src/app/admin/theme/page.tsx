"use client";

import { useState, useEffect } from "react";
import { GripVertical, Eye, EyeOff, Save, RefreshCw, Upload, Image as ImageIcon, Video, CheckCircle2, AlertCircle, Sparkles, Wand2 } from "lucide-react";
import { optimizeImageFile, optimizeHeroBannerImage } from "@/lib/utils/imageOptimizer";

type Section = {
  id: string;
  name: string;
  visible: boolean;
};

const DEFAULT_SECTIONS: Section[] = [
  { id: "hero", name: "메인 배너 (Hero)", visible: true },
  { id: "promotion", name: "프로모션 & 이벤트 배너 (Promotion)", visible: true },
  { id: "features", name: "특장점 소개 (Features)", visible: true },
  { id: "brand_story", name: "브랜드 스토리 (Brand Story)", visible: true },
  { id: "products", name: "인기 제품 소개 (Products)", visible: true },
  { id: "journal", name: "저널 / 라이프스타일 스토리 (Journal)", visible: true },
];

const LOGO_FONTS = [
  { id: "Inter", name: "Inter (기본 깔끔한 모던 고딕)", value: "'Inter', sans-serif" },
  { id: "Montserrat", name: "Montserrat (볼드하고 기하학적인 산세리프)", value: "'Montserrat', sans-serif" },
  { id: "Playfair_Display", name: "Playfair Display (고풍스럽고 우아한 세리프)", value: "'Playfair Display', serif" },
  { id: "Cormorant_Garamond", name: "Cormorant Garamond (럭셔리 프리미엄 세리프)", value: "'Cormorant Garamond', serif" },
  { id: "Cinzel", name: "Cinzel (클래식 로마 양식)", value: "'Cinzel', serif" },
  { id: "Italiana", name: "Italiana (세련된 이탈리아 감성)", value: "'Italiana', serif" },
  { id: "Syne", name: "Syne (트렌디하고 예술적인 폰트)", value: "'Syne', sans-serif" },
  { id: "Noto_Sans_KR", name: "Noto Sans KR (기본 한국어 고딕)", value: "'Noto Sans KR', sans-serif" }
];

const PRESET_BG_IMAGES = [
  { name: "미니멀 모던 키친", url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=2000&auto=format&fit=crop" },
  { name: "내추럴 리빙룸", url: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?q=80&w=2000&auto=format&fit=crop" },
  { name: "호텔급 프리미엄 욕실", url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2000&auto=format&fit=crop" },
  { name: "햇살 가득한 다이닝", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000&auto=format&fit=crop" }
];

const PRESET_BG_VIDEOS = [
  { name: "물방울 & 클린 미디어 (샘플)", url: "https://assets.mixkit.co/videos/preview/mixkit-water-bubbles-in-a-glass-of-water-42999-large.mp4" },
  { name: "자연 햇살 인테리어 (샘플)", url: "https://assets.mixkit.co/videos/preview/mixkit-sunlight-passing-through-the-leaves-of-a-plant-in-a-room-41537-large.mp4" }
];

const BODY_FONTS = [
  { id: "Pretendard", name: "Pretendard (기본 프리미엄 한글 고딕 - 강력 추천)" },
  { id: "Noto_Sans_KR", name: "Noto Sans KR (안정적인 본문 고딕)" },
  { id: "Nanum_Gothic", name: "Nanum Gothic (친근하고 부드러운 나눔고딕)" },
  { id: "Inter", name: "Inter (글로벌 모던 산세리프)" },
  { id: "MaruBuri", name: "MaruBuri / 명조 (단정하고 감성적인 세리프 명조)" },
];

const HEADING_FONTS = [
  { id: "Pretendard", name: "Pretendard (모던 고딕 - 기본)" },
  { id: "Cinzel", name: "Cinzel (클래식 로마 & 럭셔리 하이엔드)" },
  { id: "Playfair_Display", name: "Playfair Display (우아하고 품격있는 세리프)" },
  { id: "Montserrat", name: "Montserrat (볼드하고 기하학적인 타이틀)" },
  { id: "Cormorant_Garamond", name: "Cormorant Garamond (예술적 오가닉 세리프)" },
  { id: "Italiana", name: "Italiana (세련된 이탈리안 부티크)" },
];

const RADIUS_OPTIONS = [
  { id: "0px", name: "클래식 모던 사각 (0px)", desc: "각진 직선의 미니멀 스타일" },
  { id: "12px", name: "소프트 모던 (12px)", desc: "자연스러운 부드러운 모서리" },
  { id: "16px", name: "시그니처 라운드 (16px - 기본)", desc: "퍼베이드 공식 추천 라운드" },
  { id: "24px", name: "럭셔리 커브 (24px)", desc: "매끄럽고 트렌디한 곡선" },
  { id: "9999px", name: "풀 필 / 알약 (Pill)", desc: "완전 둥근 캡슐형 버튼" },
];

const THEME_PRESETS = [
  {
    name: "🖤 미니멀 모던 블랙",
    desc: "모던하고 깔끔한 블랙 앤 앰버 시그니처",
    primary: "#09090b",
    accent: "#d97706",
    bg: "#ffffff",
    bodyFont: "Pretendard",
    headingFont: "Pretendard",
    radius: "16px",
  },
  {
    name: "🌿 내추럴 에코 포레스트",
    desc: "친환경 자연 유래 감성의 딥그린 & 에메랄드",
    primary: "#064e3b",
    accent: "#059669",
    bg: "#fafbf9",
    bodyFont: "Pretendard",
    headingFont: "Cormorant_Garamond",
    radius: "20px",
  },
  {
    name: "👑 럭셔리 살롱 골드",
    desc: "호텔급 프리미엄 럭셔리 딥차콜 & 브라운 골드",
    primary: "#18181b",
    accent: "#b45309",
    bg: "#faf8f5",
    bodyFont: "Noto_Sans_KR",
    headingFont: "Cinzel",
    radius: "12px",
  },
  {
    name: "☕ 웜 샌드 & 아이보리",
    desc: "따뜻하고 편안한 웜톤 어스베이지 감성",
    primary: "#292524",
    accent: "#d97706",
    bg: "#faf6f0",
    bodyFont: "Pretendard",
    headingFont: "Playfair_Display",
    radius: "16px",
  },
  {
    name: "🌊 클린 퓨어 오션",
    desc: "신선하고 맑은 청량감의 딥네이비 & 스카이블루",
    primary: "#0f172a",
    accent: "#0284c7",
    bg: "#f8fafc",
    bodyFont: "Inter",
    headingFont: "Montserrat",
    radius: "9999px",
  },
];

export default function ThemeAdminPage() {
  // Global Theme Customizer States
  const [themePrimaryColor, setThemePrimaryColor] = useState("#09090b");
  const [themeAccentColor, setThemeAccentColor] = useState("#d97706");
  const [themeBgColor, setThemeBgColor] = useState("#ffffff");
  const [themeBodyFont, setThemeBodyFont] = useState("Pretendard");
  const [themeHeadingFont, setThemeHeadingFont] = useState("Pretendard");
  const [themeRadius, setThemeRadius] = useState("16px");

  const [heroVisible, setHeroVisible] = useState(true);
  const [heroShowText, setHeroShowText] = useState(true);
  const [heroShowCta, setHeroShowCta] = useState(true);
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [heroBgType, setHeroBgType] = useState<"IMAGE" | "VIDEO" | "COLOR">("IMAGE");
  const [heroBgUrl, setHeroBgUrl] = useState("");
  const [imageSourceType, setImageSourceType] = useState<"URL" | "FILE">("URL");
  const [videoSourceType, setVideoSourceType] = useState<"URL" | "FILE">("URL");
  const [isUploading, setIsUploading] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);

  const [logoUrl, setLogoUrl] = useState("");
  const [logoFont, setLogoFont] = useState("'Inter', sans-serif");
  const [logoSourceType, setLogoSourceType] = useState<"URL" | "FILE">("URL");
  const [isLogoUploading, setIsLogoUploading] = useState(false);

  // 'Why PERVADE?' (Features) Section States
  const [whyTitle, setWhyTitle] = useState("왜 퍼베이드인가요?");
  const [whySubtitle, setWhySubtitle] = useState("단 하나의 세정제로 경험하는 프리미엄 공간의 변화");
  const [whyCard1Title, setWhyCard1Title] = useState("강력한 오염 분해력");
  const [whyCard1Desc, setWhyCard1Desc] = useState("주방의 찌든 기름때부터 욕실의 완고한 물때까지 표면 손상 없이 깊숙이 침투하여 즉각 분해합니다.");
  const [whyCard2Title, setWhyCard2Title] = useState("안전한 성분 설계");
  const [whyCard2Desc, setWhyCard2Desc] = useState("식물 유래 계면활성제와 자연 유래 추출물로 가족 모두가 머무는 공간에 자극 없이 안전합니다.");
  const [whyCard3Title, setWhyCard3Title] = useState("지속되는 광택 & 향기");
  const [whyCard3Desc, setWhyCard3Desc] = useState("세정 후 끈적임 없는 보호막을 형성하여 오염 재착색을 방지하고 은은한 잔향을 남깁니다.");
  
  const [sections, setSections] = useState<Section[]>(DEFAULT_SECTIONS);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("로고 원본 파일 크기는 5MB 이하를 권장합니다.");
    }

    setIsLogoUploading(true);
    try {
      // High-compression for logo: 400x400 max, 80% quality (typically ~20KB)
      const dataUrl = await optimizeImageFile(file, 400, 400, 0.8);
      setLogoUrl(dataUrl);
      alert("로고 이미지가 등록되었습니다. 상단 [전체 변경사항 저장]을 눌러 적용하세요.");
    } catch (err: any) {
      console.error(err);
      alert("로고 처리 중 오류가 발생했습니다: " + (err?.message || ""));
    } finally {
      setIsLogoUploading(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vercel Serverless payload limit check
    if (file.size > 3 * 1024 * 1024) {
      alert("⚠️ 동영상 직접 업로드는 서버리스 용량 제한(3MB)이 적용됩니다.\n고화질 동영상은 YouTube / Cloudinary / 비디오 호스팅 URL(MP4) 입력을 권장합니다.");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/theme/upload-video", {
        method: "POST",
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setHeroBgUrl(data.url);
        alert("동영상이 업로드되었습니다. [전체 변경사항 저장]을 눌러 적용하세요.");
      } else {
        alert("동영상 업로드에 실패했습니다. 비디오 스트리밍 URL 직접 입력을 권장합니다.");
      }
    } catch (err: any) {
      console.error(err);
      alert("업로드 중 오류가 발생했습니다: " + (err?.message || ""));
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImageUploading(true);
    try {
      // Ultra-HD QHD 2560x1440 resolution with 90% quality (Zero pixelation on large desktop monitors)
      const dataUrl = await optimizeHeroBannerImage(file, 2560, 1440, 0.90);
      setHeroBgUrl(dataUrl);
      alert("배경 이미지가 QHD 초고화질(2560x1440)로 최적화 등록되었습니다. 상단 [전체 변경사항 저장]을 눌러 적용하세요.");
    } catch (err: any) {
      console.error(err);
      alert("이미지 처리 중 오류가 발생했습니다: " + (err?.message || ""));
    } finally {
      setIsImageUploading(false);
    }
  };

  const fetchThemeSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/theme?_t=${Date.now()}`, {
        cache: "no-store"
      });
      if (response.ok) {
        const data = await response.json();
        
        setHeroVisible(data.HERO_VISIBLE !== "false");
        setHeroShowText(data.HERO_SHOW_TEXT !== "false");
        setHeroShowCta(data.HERO_SHOW_CTA !== "false");
        setHeroTitle(data.HERO_TITLE || "완벽한 깨끗함,\n당신의 공간을 깨우다");
        setHeroSubtitle(data.HERO_SUBTITLE || "퍼베이드 다목적 세정제는 강력한 세정력과 안전한 성분으로 집안 곳곳의 찌든 때를 말끔히 지워줍니다.");
        setHeroBgType((data.HERO_BG_TYPE as any) || "IMAGE");
        const url = data.HERO_BG_URL || "";
        setHeroBgUrl(url);
        
        if (url.startsWith("/uploads/") || url.startsWith("data:")) {
          setVideoSourceType("FILE");
          setImageSourceType("FILE");
        } else {
          setVideoSourceType("URL");
          setImageSourceType("URL");
        }

        const lUrl = data.LOGO_URL || "";
        setLogoUrl(lUrl);
        if (lUrl.startsWith("/uploads/") || lUrl.startsWith("data:")) {
          setLogoSourceType("FILE");
        } else {
          setLogoSourceType("URL");
        }
        
        setLogoFont(data.LOGO_FONT || "'Inter', sans-serif");

        // Load Global Theme Customizer data
        if (data.THEME_PRIMARY_COLOR) setThemePrimaryColor(data.THEME_PRIMARY_COLOR);
        if (data.THEME_ACCENT_COLOR) setThemeAccentColor(data.THEME_ACCENT_COLOR);
        if (data.THEME_BG_COLOR) setThemeBgColor(data.THEME_BG_COLOR);
        if (data.THEME_BODY_FONT) setThemeBodyFont(data.THEME_BODY_FONT);
        if (data.THEME_HEADING_FONT) setThemeHeadingFont(data.THEME_HEADING_FONT);
        if (data.THEME_RADIUS) setThemeRadius(data.THEME_RADIUS);

        // Load 'Why PERVADE?' section data
        if (data.WHY_TITLE) setWhyTitle(data.WHY_TITLE);
        if (data.WHY_SUBTITLE) setWhySubtitle(data.WHY_SUBTITLE);
        if (data.WHY_CARD1_TITLE) setWhyCard1Title(data.WHY_CARD1_TITLE);
        if (data.WHY_CARD1_DESC) setWhyCard1Desc(data.WHY_CARD1_DESC);
        if (data.WHY_CARD2_TITLE) setWhyCard2Title(data.WHY_CARD2_TITLE);
        if (data.WHY_CARD2_DESC) setWhyCard2Desc(data.WHY_CARD2_DESC);
        if (data.WHY_CARD3_TITLE) setWhyCard3Title(data.WHY_CARD3_TITLE);
        if (data.WHY_CARD3_DESC) setWhyCard3Desc(data.WHY_CARD3_DESC);

        if (data.HOME_SECTIONS_ORDER) {
          try {
            const parsed = JSON.parse(data.HOME_SECTIONS_ORDER);
            const mapped = parsed.map((ps: any) => {
              const def = DEFAULT_SECTIONS.find(d => d.id === ps.id);
              return {
                id: ps.id,
                name: def ? def.name : ps.id,
                visible: ps.visible ?? true
              };
            });
            
            DEFAULT_SECTIONS.forEach(ds => {
              if (!mapped.some((m: any) => m.id === ds.id)) {
                mapped.push(ds);
              }
            });

            // Sync hero visible from HERO_VISIBLE policy if present
            if (data.HERO_VISIBLE !== undefined) {
              const heroSec = mapped.find((s: any) => s.id === "hero");
              if (heroSec) heroSec.visible = data.HERO_VISIBLE !== "false";
            }

            setSections(mapped);
          } catch (e) {
            setSections(DEFAULT_SECTIONS);
          }
        } else {
          setSections(DEFAULT_SECTIONS);
        }
      }
    } catch (error) {
      console.error("Error loading theme settings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThemeSettings();
  }, []);

  const moveSection = (index: number, direction: "UP" | "DOWN") => {
    const newSections = [...sections];
    if (direction === "UP" && index > 0) {
      [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
    } else if (direction === "DOWN" && index < newSections.length - 1) {
      [newSections[index + 1], newSections[index]] = [newSections[index], newSections[index + 1]];
    }
    setSections(newSections);
  };

  const toggleVisibility = (index: number) => {
    const newSections = [...sections];
    newSections[index].visible = !newSections[index].visible;
    if (newSections[index].id === "hero") {
      setHeroVisible(newSections[index].visible);
    }
    setSections(newSections);
  };

  const handleHeroVisibleToggle = (visible: boolean) => {
    setHeroVisible(visible);
    const newSections = sections.map(s => s.id === "hero" ? { ...s, visible } : s);
    setSections(newSections);
  };

  const handleApplyPreset = (preset: typeof THEME_PRESETS[0]) => {
    setThemePrimaryColor(preset.primary);
    setThemeAccentColor(preset.accent);
    setThemeBgColor(preset.bg);
    setThemeBodyFont(preset.bodyFont);
    setThemeHeadingFont(preset.headingFont);
    setThemeRadius(preset.radius);
    alert(`🎨 '${preset.name}' 테마 프리셋이 적용되었습니다!\n하단의 [전체 변경사항 저장]을 누르면 쇼핑몰에 최종 반영됩니다.`);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const orderToSave = sections.map(s => ({
        id: s.id,
        visible: s.id === "hero" ? heroVisible : s.visible
      }));
      
      const payload = {
        THEME_PRIMARY_COLOR: themePrimaryColor,
        THEME_ACCENT_COLOR: themeAccentColor,
        THEME_BG_COLOR: themeBgColor,
        THEME_BODY_FONT: themeBodyFont,
        THEME_HEADING_FONT: themeHeadingFont,
        THEME_RADIUS: themeRadius,
        HERO_VISIBLE: heroVisible ? "true" : "false",
        HERO_SHOW_TEXT: heroShowText ? "true" : "false",
        HERO_SHOW_CTA: heroShowCta ? "true" : "false",
        HERO_TITLE: heroTitle || "",
        HERO_SUBTITLE: heroSubtitle || "",
        HERO_BG_TYPE: heroBgType || "IMAGE",
        HERO_BG_URL: heroBgUrl || "",
        LOGO_URL: logoUrl || "",
        LOGO_FONT: logoFont || "'Inter', sans-serif",
        HOME_SECTIONS_ORDER: JSON.stringify(orderToSave),
        WHY_TITLE: whyTitle,
        WHY_SUBTITLE: whySubtitle,
        WHY_CARD1_TITLE: whyCard1Title,
        WHY_CARD1_DESC: whyCard1Desc,
        WHY_CARD2_TITLE: whyCard2Title,
        WHY_CARD2_DESC: whyCard2Desc,
        WHY_CARD3_TITLE: whyCard3Title,
        WHY_CARD3_DESC: whyCard3Desc,
      };

      const payloadStr = JSON.stringify(payload);
      // Payload size safeguard for Vercel Serverless Function (max 2.5MB)
      if (payloadStr.length > 2.5 * 1024 * 1024) {
        alert("⚠️ 등록된 배경 이미지 또는 데이터 용량이 너무 큽니다 (2.5MB 초과).\n웹 이미지 URL을 입력하시거나 더 작은 사진을 업로드해 주세요.");
        setIsSaving(false);
        return;
      }

      const response = await fetch("/api/admin/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payloadStr,
      });

      const responseText = await response.text();
      let data: any = {};
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        data = { error: responseText };
      }

      if (response.ok && data.success) {
        setSaveSuccess(true);
        alert("✅ 테마 및 메인 배너 설정이 성공적으로 저장되었습니다!\n쇼핑몰 메인페이지에 즉시 반영되었습니다.");
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        alert(`❌ 저장 실패 (코드: ${response.status})\n원인: ${data.error || responseText || "알 수 없는 오류"}`);
      }
    } catch (error: any) {
      console.error("Failed to save theme settings:", error);
      alert(`❌ 저장 중 네트워크 통신 오류가 발생했습니다: ${error?.message || "네트워크 오류"}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-zinc-600" />
        <span className="text-sm font-semibold">테마 설정을 불러오는 중입니다...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 uppercase">
              Brand Theme &amp; Layout CMS
            </span>
            {saveSuccess && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> 저장 완료됨
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1 text-zinc-950">
            메인페이지 테마 및 레이아웃 관리
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            홈페이지 메인 비디오/배경 이미지, 헤드라인 문구, 브랜드 로고, 폰트 및 섹션 노출 순서를 실시간으로 변경합니다.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchThemeSettings}
            className="p-2.5 bg-white border rounded-xl text-zinc-600 hover:bg-zinc-50 transition-colors shadow-xs"
            title="새로고침"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-zinc-950 text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all shadow-md disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-amber-400" />
            {isSaving ? "저장 중..." : "전체 변경사항 저장"}
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. Global Theme & Style Customizer (Typography & Colors) */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border p-6 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
          <div>
            <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              1. 글로벌 테마 & 스타일 커스터마이저 (폰트 / 컬러 / 모서리 / 프리셋)
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              쇼핑몰 전체의 대표 타이포그래피(폰트), 포인트 컬러, 버튼 모서리 둥글기를 원클릭으로 자유롭게 변경합니다.
            </p>
          </div>
        </div>

        {/* 1-1. One-Click Theme Presets */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-zinc-700">⚡ 1초 원클릭 완성형 테마 프리셋</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {THEME_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="p-3 rounded-xl border bg-zinc-50 hover:bg-white hover:border-zinc-900 hover:shadow-md transition-all text-left space-y-1.5 group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-900 group-hover:text-amber-600 transition-colors">
                    {preset.name}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full border shadow-2xs" style={{ backgroundColor: preset.primary }} />
                    <span className="w-3 h-3 rounded-full border shadow-2xs" style={{ backgroundColor: preset.accent }} />
                  </div>
                </div>
                <p className="text-[11px] text-zinc-500 leading-tight">{preset.desc}</p>
                <div className="text-[10px] text-zinc-400 font-mono">
                  {preset.radius} • {preset.headingFont}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 1-2. Detailed Customizer 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t">
          {/* Typography Settings */}
          <div className="space-y-4 p-4 rounded-xl bg-zinc-50 border">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px] font-bold">A</span>
              <h3 className="text-xs font-bold text-zinc-900">타이포그래피 (폰트 설정)</h3>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-medium text-zinc-600">본문 폰트 (Body Font)</label>
              <select
                value={themeBodyFont}
                onChange={(e) => setThemeBodyFont(e.target.value)}
                className="w-full px-3 py-2 bg-white rounded-lg border text-xs font-medium focus:outline-none focus:ring-1 focus:ring-zinc-900"
              >
                {BODY_FONTS.map((font) => (
                  <option key={font.id} value={font.id}>
                    {font.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-medium text-zinc-600">제목/영문 폰트 (Heading Font)</label>
              <select
                value={themeHeadingFont}
                onChange={(e) => setThemeHeadingFont(e.target.value)}
                className="w-full px-3 py-2 bg-white rounded-lg border text-xs font-medium focus:outline-none focus:ring-1 focus:ring-zinc-900"
              >
                {HEADING_FONTS.map((font) => (
                  <option key={font.id} value={font.id}>
                    {font.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Color Palette Settings */}
          <div className="space-y-4 p-4 rounded-xl bg-zinc-50 border">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px] font-bold">C</span>
              <h3 className="text-xs font-bold text-zinc-900">컬러 팔레트 (Color Palette)</h3>
            </div>

            {/* Primary Color */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-medium text-zinc-600">메인 포인트 컬러 (Primary)</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={themePrimaryColor}
                  onChange={(e) => setThemePrimaryColor(e.target.value)}
                  className="w-8 h-8 rounded-lg border cursor-pointer p-0.5 bg-white"
                />
                <input
                  type="text"
                  value={themePrimaryColor}
                  onChange={(e) => setThemePrimaryColor(e.target.value)}
                  placeholder="#09090b"
                  className="flex-1 px-3 py-1.5 bg-white rounded-lg border text-xs font-mono font-bold uppercase focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>
            </div>

            {/* Accent Color */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-medium text-zinc-600">서브 액센트 컬러 (Accent)</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={themeAccentColor}
                  onChange={(e) => setThemeAccentColor(e.target.value)}
                  className="w-8 h-8 rounded-lg border cursor-pointer p-0.5 bg-white"
                />
                <input
                  type="text"
                  value={themeAccentColor}
                  onChange={(e) => setThemeAccentColor(e.target.value)}
                  placeholder="#d97706"
                  className="flex-1 px-3 py-1.5 bg-white rounded-lg border text-xs font-mono font-bold uppercase focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>
            </div>

            {/* Background Tone */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-medium text-zinc-600">배경 베이스 톤 (Background)</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={themeBgColor}
                  onChange={(e) => setThemeBgColor(e.target.value)}
                  className="w-8 h-8 rounded-lg border cursor-pointer p-0.5 bg-white"
                />
                <input
                  type="text"
                  value={themeBgColor}
                  onChange={(e) => setThemeBgColor(e.target.value)}
                  placeholder="#ffffff"
                  className="flex-1 px-3 py-1.5 bg-white rounded-lg border text-xs font-mono font-bold uppercase focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>
            </div>
          </div>

          {/* Border Radius & Live Preview Box */}
          <div className="space-y-4 p-4 rounded-xl bg-zinc-50 border flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px] font-bold">R</span>
                <h3 className="text-xs font-bold text-zinc-900">버튼/카드 모서리 둥글기 (Radius)</h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {RADIUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setThemeRadius(opt.id)}
                    className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition-all ${
                      themeRadius === opt.id
                        ? "bg-zinc-950 text-white border-zinc-950 shadow-xs"
                        : "bg-white text-zinc-700 hover:bg-zinc-100"
                    }`}
                  >
                    {opt.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Interactive Preview Box */}
            <div 
              className="p-4 border rounded-xl shadow-2xs space-y-2.5 transition-all"
              style={{ 
                backgroundColor: themeBgColor,
                borderRadius: themeRadius === "9999px" ? "20px" : themeRadius 
              }}
            >
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
                실시간 라이브 미리보기
              </span>
              <h4 
                className="text-base font-bold tracking-tight"
                style={{ 
                  color: themePrimaryColor,
                  fontFamily: themeHeadingFont === "Pretendard" ? "'Pretendard', sans-serif" : `'${themeHeadingFont}', serif`
                }}
              >
                PERVADE Premium Clean
              </h4>
              <p className="text-xs text-zinc-500 leading-snug">
                단 하나의 세정제로 완성하는 품격 있는 공간 케어
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  style={{ 
                    backgroundColor: themePrimaryColor,
                    borderRadius: themeRadius 
                  }}
                  className="px-3.5 py-1.5 text-white text-xs font-bold shadow-xs hover:opacity-90"
                >
                  구매하기
                </button>
                <span 
                  style={{ color: themeAccentColor }}
                  className="text-xs font-bold"
                >
                  ★ 4.9 (1,280 리뷰)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* 2. Hero Banner Content */}
        <div className={`bg-white rounded-2xl border p-6 space-y-6 shadow-xs transition-all ${!heroVisible ? "opacity-75 bg-zinc-50" : ""}`}>
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
              <span>2. 메인 배너 (Hero) 텍스트 및 미디어</span>
            </h2>
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${heroVisible ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-zinc-200 text-zinc-700"}`}>
              {heroVisible ? "🟢 화면 노출 중" : "⚪ 숨김 상태"}
            </span>
          </div>

          {/* MAIN HERO VISIBILITY TOGGLE */}
          <div className="p-3.5 bg-zinc-50 border rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-zinc-900 block">메인 배너 섹션 전체 노출 여부</span>
                <span className="text-[10px] text-zinc-500">배너 자체를 홈페이지 첫 화면에서 완전히 숨기거나 노출합니다.</span>
              </div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => handleHeroVisibleToggle(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    heroVisible
                      ? "bg-zinc-950 text-white shadow-xs"
                      : "bg-white text-zinc-600 border hover:bg-zinc-100"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-400" /> 노출 (보이기)
                </button>
                <button
                  type="button"
                  onClick={() => handleHeroVisibleToggle(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    !heroVisible
                      ? "bg-rose-600 text-white shadow-xs"
                      : "bg-white text-zinc-600 border hover:bg-zinc-100"
                  }`}
                >
                  <EyeOff className="w-3.5 h-3.5" /> 숨김 (안보이게)
                </button>
              </div>
            </div>

            {/* Sub-toggles: Text & CTA visibility */}
            {heroVisible && (
              <div className="pt-2 border-t border-zinc-200 flex flex-wrap gap-4 text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-zinc-700">
                  <input
                    type="checkbox"
                    checked={heroShowText}
                    onChange={(e) => setHeroShowText(e.target.checked)}
                    className="w-4 h-4 rounded text-zinc-900 focus:ring-zinc-900"
                  />
                  <span>헤드라인 텍스트 표시</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-zinc-700">
                  <input
                    type="checkbox"
                    checked={heroShowCta}
                    onChange={(e) => setHeroShowCta(e.target.checked)}
                    className="w-4 h-4 rounded text-zinc-900 focus:ring-zinc-900"
                  />
                  <span>제품 둘러보기 바로가기 버튼(CTA) 표시</span>
                </label>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">메인 헤드라인 타이틀</label>
              <textarea 
                rows={2}
                value={heroTitle}
                onChange={e => setHeroTitle(e.target.value)}
                disabled={!heroVisible || !heroShowText}
                className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 text-xs font-bold leading-relaxed disabled:bg-zinc-100 disabled:text-zinc-400"
                placeholder="완벽한 깨끗함,&#10;당신의 공간을 깨우다"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">서브 설명 문구</label>
              <textarea 
                rows={3}
                value={heroSubtitle}
                onChange={e => setHeroSubtitle(e.target.value)}
                disabled={!heroVisible || !heroShowText}
                className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 text-xs leading-relaxed disabled:bg-zinc-100 disabled:text-zinc-400"
                placeholder="퍼베이드 다목적 세정제는 강력한 세정력과 안전한 성분으로 집안 곳곳의 찌든 때를 말끔히 지워줍니다."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-2">배경 미디어 타입 선택</label>
              <div className="grid grid-cols-3 gap-2">
                {(["IMAGE", "VIDEO", "COLOR"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setHeroBgType(type)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      heroBgType === type 
                        ? "bg-zinc-950 text-white border-zinc-950 shadow-xs" 
                        : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
                    }`}
                  >
                    {type === "IMAGE" ? "🖼️ 이미지" : type === "VIDEO" ? "🎬 동영상" : "🎨 단색 그라데이션"}
                  </button>
                ))}
              </div>
            </div>

            {/* VIDEO Setting */}
            {heroBgType === "VIDEO" && (
              <div className="space-y-3 pt-2">
                <div className="flex gap-4 p-2 bg-zinc-50 rounded-xl border text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer font-semibold">
                    <input 
                      type="radio" 
                      name="videoSourceType"
                      checked={videoSourceType === "URL"}
                      onChange={() => setVideoSourceType("URL")}
                      className="text-zinc-900 focus:ring-zinc-900"
                    />
                    외부 비디오 URL
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-semibold">
                    <input 
                      type="radio" 
                      name="videoSourceType"
                      checked={videoSourceType === "FILE"}
                      onChange={() => setVideoSourceType("FILE")}
                      className="text-zinc-900 focus:ring-zinc-900"
                    />
                    서버 직접 업로드 (3MB 이하)
                  </label>
                </div>

                {videoSourceType === "URL" ? (
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">비디오 스트리밍 URL (mp4)</label>
                      <input 
                        type="url" 
                        value={heroBgUrl}
                        onChange={e => setHeroBgUrl(e.target.value)}
                        className="w-full p-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 text-xs font-mono"
                        placeholder="https://.../video.mp4"
                      />
                    </div>
                    {/* Preset Videos */}
                    <div>
                      <span className="text-[10px] text-zinc-500 font-bold block mb-1">🎬 추천 고화질 배경 비디오 프리셋 (원클릭 적용):</span>
                      <div className="flex flex-wrap gap-1.5">
                        {PRESET_BG_VIDEOS.map((v, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => { setHeroBgUrl(v.url); }}
                            className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 rounded-lg text-[11px] font-semibold text-zinc-700 transition-colors"
                          >
                            + {v.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border-2 border-dashed rounded-xl bg-zinc-50 flex flex-col items-center justify-center gap-2">
                    <label className="px-4 py-2.5 bg-zinc-950 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer hover:bg-zinc-800 transition-colors flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      {isUploading ? "동영상 파일 업로드 중..." : "MP4 파일 선택 및 업로드 (3MB 이하)"}
                      <input 
                        type="file" 
                        accept="video/mp4,video/webm"
                        onChange={handleVideoUpload}
                        disabled={isUploading}
                        className="hidden" 
                      />
                    </label>
                    <p className="text-[10px] text-zinc-400">대용량 1080p 영상은 외부 비디오 URL(Cloudinary/YouTube)을 권장합니다.</p>
                  </div>
                )}

                {heroBgUrl && (
                  <div className="mt-2 border rounded-xl overflow-hidden shadow-xs aspect-video bg-black relative">
                    <video 
                      src={heroBgUrl} 
                      className="w-full h-full object-cover" 
                      controls 
                      muted 
                      playsInline
                    />
                  </div>
                )}
              </div>
            )}

            {/* IMAGE Setting */}
            {heroBgType === "IMAGE" && (
              <div className="space-y-3 pt-2">
                <div className="flex gap-4 p-2 bg-zinc-50 rounded-xl border text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer font-semibold">
                    <input 
                      type="radio" 
                      name="imageSourceType"
                      checked={imageSourceType === "URL"}
                      onChange={() => setImageSourceType("URL")}
                      className="text-zinc-900 focus:ring-zinc-900"
                    />
                    🌐 외부 고화질 원본 URL (무손실 100% 4K)
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-semibold">
                    <input 
                      type="radio" 
                      name="imageSourceType"
                      checked={imageSourceType === "FILE"}
                      onChange={() => setImageSourceType("FILE")}
                      className="text-zinc-900 focus:ring-zinc-900"
                    />
                    📁 PC 파일 직접 업로드 (QHD 2560x1440 초고해상도)
                  </label>
                </div>

                {imageSourceType === "URL" ? (
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">초고화질 이미지 주소 (URL - 원본 무손실 100%)</label>
                      <input 
                        type="url" 
                        value={heroBgUrl}
                        onChange={e => setHeroBgUrl(e.target.value)}
                        className="w-full p-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 text-xs font-mono"
                        placeholder="https://images.unsplash.com/... 또는 https://i.ibb.co/..."
                      />
                      <p className="text-[10px] text-zinc-500 mt-1">
                        💡 <strong>TIP</strong>: 클라우드 스토리지(Supabase, AWS S3, ImgBB, Unsplash 등)에 올린 원본 링크를 넣으시면 <strong>압축이나 깨짐 없이 100% 무손실 4K 해상도</strong>로 선명하게 표시됩니다.
                      </p>
                    </div>
                    {/* Preset Images */}
                    <div>
                      <span className="text-[10px] text-zinc-500 font-bold block mb-1">🖼️ 고화질 프리미엄 인테리어 프리셋 (원클릭 적용):</span>
                      <div className="flex flex-wrap gap-1.5">
                        {PRESET_BG_IMAGES.map((img, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => { setHeroBgUrl(img.url); }}
                            className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 rounded-lg text-[11px] font-semibold text-zinc-700 transition-colors"
                          >
                            + {img.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border-2 border-dashed rounded-xl bg-zinc-50 flex flex-col items-center justify-center gap-2">
                    <label className="px-4 py-2.5 bg-zinc-950 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer hover:bg-zinc-800 transition-colors flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      {isImageUploading ? "초고해상도 최적화 중..." : "JPG / PNG 파일 선택 (QHD 2560x1440 자동 보정)"}
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageBgUpload}
                        disabled={isImageUploading}
                        className="hidden" 
                      />
                    </label>
                    <p className="text-[10px] text-zinc-500 text-center">
                      와이드 모니터에서도 픽셀 깨짐이 없도록 <strong>QHD(2560px) 90% 고화질 렌더링</strong>으로 최적화됩니다.
                    </p>
                  </div>
                )}

                {heroBgUrl && (
                  <div className="mt-2 border rounded-xl overflow-hidden shadow-xs aspect-video relative">
                    <img 
                      src={heroBgUrl} 
                      alt="Hero Background Preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 2. Logo Settings */}
        <div className="bg-white rounded-2xl border p-6 space-y-6 shadow-xs">
          <h2 className="text-base font-bold border-b pb-3 text-zinc-900 flex items-center gap-2">
            <span>2. 쇼핑몰 메인 로고 &amp; 폰트 설정</span>
          </h2>
          
          <div className="flex gap-4 p-2 bg-zinc-50 rounded-xl border text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer font-semibold">
              <input 
                type="radio" 
                name="logoSourceType"
                checked={logoSourceType === "URL"}
                onChange={() => setLogoSourceType("URL")}
                className="text-zinc-900 focus:ring-zinc-900"
              />
              외부 이미지 URL
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer font-semibold">
              <input 
                type="radio" 
                name="logoSourceType"
                checked={logoSourceType === "FILE"}
                onChange={() => setLogoSourceType("FILE")}
                className="text-zinc-900 focus:ring-zinc-900"
              />
              로고 이미지 직접 업로드
            </label>
          </div>

          {logoSourceType === "URL" ? (
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">로고 이미지 URL</label>
              <input 
                type="url" 
                value={logoUrl}
                onChange={e => setLogoUrl(e.target.value)}
                className="w-full p-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 text-xs"
                placeholder="https://.../logo.png (비워둘 시 텍스트 로고 사용)"
              />
            </div>
          ) : (
            <div className="p-4 border-2 border-dashed rounded-xl bg-zinc-50 flex flex-col items-center justify-center gap-2">
              <label className="px-4 py-2.5 bg-zinc-950 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer hover:bg-zinc-800 transition-colors flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                {isLogoUploading ? "로고 업로드 중..." : "로고 이미지 선택 및 업로드"}
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={isLogoUploading}
                  className="hidden" 
                />
              </label>
              <p className="text-[10px] text-zinc-400">PNG, SVG 등 투명한 배경 이미지를 권장합니다.</p>
            </div>
          )}

          {logoUrl ? (
            <div className="p-4 border rounded-xl bg-zinc-50 shadow-xs flex flex-col items-center justify-center gap-2">
              <div className="h-12 flex items-center justify-center bg-zinc-900 rounded-lg p-2 w-full">
                <img 
                  src={logoUrl} 
                  alt="Logo Preview" 
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <button 
                type="button"
                onClick={() => setLogoUrl("")}
                className="text-[11px] text-red-600 underline font-semibold mt-1 hover:text-red-800"
              >
                이미지 로고 제거 (텍스트 로고로 복원)
              </button>
            </div>
          ) : (
            <div className="space-y-4 pt-2 border-t">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">텍스트 로고 폰트(글꼴) 스타일</label>
                <select
                  value={logoFont}
                  onChange={(e) => setLogoFont(e.target.value)}
                  className="w-full p-2.5 border rounded-xl bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-900"
                >
                  {LOGO_FONTS.map((font) => (
                    <option key={font.id} value={font.value}>
                      {font.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-4 border rounded-xl bg-zinc-50 flex flex-col items-center justify-center gap-1">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">실시간 텍스트 로고 미리보기</span>
                <span 
                  className="text-2xl font-bold tracking-tight text-zinc-900 py-2"
                  style={{ fontFamily: logoFont }}
                >
                  PERVADE
                </span>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* 3. 'Why PERVADE?' Features Customization */}
      <div className="bg-white rounded-2xl border p-6 space-y-6 shadow-xs">
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              3. &apos;왜 퍼베이드인가요?&apos; (3대 핵심 특장점) 문구 편집
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              메인 홈페이지에 노출되는 대표 타이틀 및 3개 핵심 특장점 카드의 제목과 상세 문구를 원하는 내용으로 직접 수정합니다.
            </p>
          </div>
        </div>

        {/* Section Header Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-50 p-4 rounded-xl border">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-zinc-700">섹션 메인 타이틀</label>
            <input
              type="text"
              value={whyTitle}
              onChange={(e) => setWhyTitle(e.target.value)}
              placeholder="왜 퍼베이드인가요?"
              className="w-full px-3.5 py-2 bg-white rounded-lg border text-xs font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-zinc-700">섹션 서브 타이틀 (한 줄 설명)</label>
            <input
              type="text"
              value={whySubtitle}
              onChange={(e) => setWhySubtitle(e.target.value)}
              placeholder="단 하나의 세정제로 경험하는 프리미엄 공간의 변화"
              className="w-full px-3.5 py-2 bg-white rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>
        </div>

        {/* 3 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1 */}
          <div className="p-4 rounded-xl border bg-white space-y-3 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-zinc-950 text-white flex items-center justify-center text-[10px] font-bold">1</span>
              <span className="font-bold text-xs text-zinc-800">특장점 카드 1 (오염 분해)</span>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-medium text-zinc-500">카드 제목</label>
              <input
                type="text"
                value={whyCard1Title}
                onChange={(e) => setWhyCard1Title(e.target.value)}
                placeholder="강력한 오염 분해력"
                className="w-full px-3 py-1.5 bg-zinc-50 rounded-lg border text-xs font-bold focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-medium text-zinc-500">카드 설명 문구</label>
              <textarea
                rows={3}
                value={whyCard1Desc}
                onChange={(e) => setWhyCard1Desc(e.target.value)}
                placeholder="주방의 찌든 기름때부터 욕실의 완고한 물때까지 표면 손상 없이 깊숙이 침투하여 즉각 분해합니다."
                className="w-full px-3 py-1.5 bg-zinc-50 rounded-lg border text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-4 rounded-xl border bg-white space-y-3 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-zinc-950 text-white flex items-center justify-center text-[10px] font-bold">2</span>
              <span className="font-bold text-xs text-zinc-800">특장점 카드 2 (성분 안전)</span>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-medium text-zinc-500">카드 제목</label>
              <input
                type="text"
                value={whyCard2Title}
                onChange={(e) => setWhyCard2Title(e.target.value)}
                placeholder="안전한 성분 설계"
                className="w-full px-3 py-1.5 bg-zinc-50 rounded-lg border text-xs font-bold focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-medium text-zinc-500">카드 설명 문구</label>
              <textarea
                rows={3}
                value={whyCard2Desc}
                onChange={(e) => setWhyCard2Desc(e.target.value)}
                placeholder="식물 유래 계면활성제와 자연 유래 추출물로 가족 모두가 머무는 공간에 자극 없이 안전합니다."
                className="w-full px-3 py-1.5 bg-zinc-50 rounded-lg border text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-4 rounded-xl border bg-white space-y-3 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-zinc-950 text-white flex items-center justify-center text-[10px] font-bold">3</span>
              <span className="font-bold text-xs text-zinc-800">특장점 카드 3 (광택 & 잔향)</span>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-medium text-zinc-500">카드 제목</label>
              <input
                type="text"
                value={whyCard3Title}
                onChange={(e) => setWhyCard3Title(e.target.value)}
                placeholder="지속되는 광택 & 향기"
                className="w-full px-3 py-1.5 bg-zinc-50 rounded-lg border text-xs font-bold focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-medium text-zinc-500">카드 설명 문구</label>
              <textarea
                rows={3}
                value={whyCard3Desc}
                onChange={(e) => setWhyCard3Desc(e.target.value)}
                placeholder="세정 후 끈적임 없는 보호막을 형성하여 오염 재착색을 방지하고 은은한 잔향을 남깁니다."
                className="w-full px-3 py-1.5 bg-zinc-50 rounded-lg border text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Section Reordering */}
      <div className="bg-white rounded-2xl border p-6 space-y-6 shadow-xs">
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h2 className="text-base font-bold text-zinc-900">4. 메인페이지 섹션 순서 및 노출 관리</h2>
            <p className="text-xs text-zinc-500 mt-0.5">화살표 버튼을 클릭하여 순서를 조정하거나 노출/숨김 여부를 변경하세요.</p>
          </div>
        </div>

        <div className="space-y-2.5">
          {sections.map((section, index) => (
            <div 
              key={section.id} 
              className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                section.visible ? "bg-white border-zinc-200 shadow-xs" : "bg-zinc-50 border-zinc-100 opacity-60"
              }`}
            >
              <div className="flex items-center gap-3">
                <GripVertical className="w-4 h-4 text-zinc-400" />
                <span className="font-bold text-xs sm:text-sm text-zinc-900">{section.name}</span>
                <span className="text-[10px] text-zinc-400 font-mono">({section.id})</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => moveSection(index, "UP")}
                  disabled={index === 0}
                  className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-xs font-bold rounded-lg disabled:opacity-30 transition-colors"
                >
                  ▲ 위로
                </button>
                <button
                  type="button"
                  onClick={() => moveSection(index, "DOWN")}
                  disabled={index === sections.length - 1}
                  className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-xs font-bold rounded-lg disabled:opacity-30 transition-colors"
                >
                  ▼ 아래로
                </button>
                <button
                  type="button"
                  onClick={() => toggleVisibility(index)}
                  className={`px-3 py-1 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    section.visible 
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" 
                      : "bg-zinc-200 text-zinc-600 border-zinc-300 hover:bg-zinc-300"
                  }`}
                >
                  {section.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  {section.visible ? "노출 중" : "숨김"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-zinc-950 text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-zinc-800 transition-all shadow-md disabled:opacity-50"
        >
          <Save className="w-4 h-4 text-amber-400" />
          {isSaving ? "저장 중..." : "전체 변경사항 저장"}
        </button>
      </div>
    </div>
  );
}
