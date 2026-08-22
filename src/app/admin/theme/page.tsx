"use client";

import { useState, useEffect } from "react";
import { GripVertical, Eye, EyeOff, Save, RefreshCw, Upload, Image as ImageIcon, Video, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { optimizeImageFile } from "@/lib/utils/imageOptimizer";

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

export default function ThemeAdminPage() {
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
  
  const [sections, setSections] = useState<Section[]>(DEFAULT_SECTIONS);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLogoUploading(true);
    try {
      // 1. Optimize image in browser
      const dataUrl = await optimizeImageFile(file, 800, 800, 0.9);
      setLogoUrl(dataUrl);
      alert("로고 이미지가 설정되었습니다. 상단 또는 하단의 [전체 변경사항 저장]을 눌러 최종 적용해 주세요.");
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
        alert("동영상이 업로드되었습니다. [전체 변경사항 저장]을 눌러 최종 적용해 주세요.");
      } else {
        alert("동영상 파일 크기가 너무 큽니다. 비디오 URL 직접 입력을 권장합니다.");
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
      // Optimize image in browser down to 1600x900
      const dataUrl = await optimizeImageFile(file, 1600, 900, 0.85);
      setHeroBgUrl(dataUrl);
      alert("배경 이미지가 설정되었습니다. 상단 또는 하단의 [전체 변경사항 저장]을 눌러 최종 적용해 주세요.");
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
    setSections(newSections);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const orderToSave = sections.map(s => ({ id: s.id, visible: s.visible }));
      
      const payload = {
        HERO_TITLE: heroTitle || "",
        HERO_SUBTITLE: heroSubtitle || "",
        HERO_BG_TYPE: heroBgType || "IMAGE",
        HERO_BG_URL: heroBgUrl || "",
        LOGO_URL: logoUrl || "",
        LOGO_FONT: logoFont || "'Inter', sans-serif",
        HOME_SECTIONS_ORDER: JSON.stringify(orderToSave)
      };

      const response = await fetch("/api/admin/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success) {
        setSaveSuccess(true);
        alert("✅ 테마 및 메인 배너 설정이 성공적으로 저장되었습니다!\n쇼핑몰 메인페이지에 즉시 적용되었습니다.");
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        alert(`❌ 저장에 실패했습니다: ${data.error || "서버 응답 오류 (상태코드: " + response.status + ")"}`);
      }
    } catch (error: any) {
      console.error("Failed to save theme settings:", error);
      alert(`❌ 저장 중 네트워크 오류가 발생했습니다: ${error?.message || "알 수 없는 오류"}`);
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* 1. Hero Banner Content */}
        <div className="bg-white rounded-2xl border p-6 space-y-6 shadow-xs">
          <h2 className="text-base font-bold border-b pb-3 text-zinc-900 flex items-center gap-2">
            <span>1. 메인 배너 (Hero) 텍스트 및 미디어</span>
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">메인 헤드라인 타이틀</label>
              <textarea 
                rows={2}
                value={heroTitle}
                onChange={e => setHeroTitle(e.target.value)}
                className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 text-xs font-bold leading-relaxed"
                placeholder="완벽한 깨끗함,&#10;당신의 공간을 깨우다"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">서브 설명 문구</label>
              <textarea 
                rows={3}
                value={heroSubtitle}
                onChange={e => setHeroSubtitle(e.target.value)}
                className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 text-xs leading-relaxed"
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
                    서버 직접 업로드 (MP4)
                  </label>
                </div>

                {videoSourceType === "URL" ? (
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
                ) : (
                  <div className="p-4 border-2 border-dashed rounded-xl bg-zinc-50 flex flex-col items-center justify-center gap-2">
                    <label className="px-4 py-2.5 bg-zinc-950 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer hover:bg-zinc-800 transition-colors flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      {isUploading ? "동영상 파일 업로드 중..." : "MP4 파일 선택 및 업로드"}
                      <input 
                        type="file" 
                        accept="video/mp4,video/webm"
                        onChange={handleVideoUpload}
                        disabled={isUploading}
                        className="hidden" 
                      />
                    </label>
                    <p className="text-[10px] text-zinc-400">권장: 1080p 이하, 50MB 이내의 mp4 파일</p>
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
                    외부 이미지 URL
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-semibold">
                    <input 
                      type="radio" 
                      name="imageSourceType"
                      checked={imageSourceType === "FILE"}
                      onChange={() => setImageSourceType("FILE")}
                      className="text-zinc-900 focus:ring-zinc-900"
                    />
                    일반 JPG/PNG 직접 업로드
                  </label>
                </div>

                {imageSourceType === "URL" ? (
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">이미지 주소 (URL)</label>
                    <input 
                      type="url" 
                      value={heroBgUrl}
                      onChange={e => setHeroBgUrl(e.target.value)}
                      className="w-full p-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 text-xs"
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>
                ) : (
                  <div className="p-4 border-2 border-dashed rounded-xl bg-zinc-50 flex flex-col items-center justify-center gap-2">
                    <label className="px-4 py-2.5 bg-zinc-950 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer hover:bg-zinc-800 transition-colors flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      {isImageUploading ? "이미지 업로드 중..." : "JPG / PNG 파일 선택 및 자동 최적화 업로드"}
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageBgUpload}
                        disabled={isImageUploading}
                        className="hidden" 
                      />
                    </label>
                    <p className="text-[10px] text-zinc-400">대용량 스마트폰 사진도 브라우저에서 자동 압축되어 0.1초 만에 최적화됩니다.</p>
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

      {/* 3. Section Reordering */}
      <div className="bg-white rounded-2xl border p-6 space-y-6 shadow-xs">
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h2 className="text-base font-bold text-zinc-900">3. 메인페이지 섹션 순서 및 노출 관리</h2>
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
