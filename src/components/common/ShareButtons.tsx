"use client";

import { useState } from "react";
import { Share2, Link as LinkIcon, Check, MessageCircle } from "lucide-react";

interface ShareButtonsProps {
  title: string;
  description?: string;
  url?: string;
  className?: string;
}

export function ShareButtons({ title, description = "", url, className = "" }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    if (url) return url;
    if (typeof window !== "undefined") {
      return window.location.href;
    }
    return "https://pervade.vercel.app";
  };

  const handleCopyLink = async () => {
    const currentUrl = getShareUrl();
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(currentUrl);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = currentUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error(err);
      alert("링크 복사에 실패했습니다.");
    }
  };

  const handleShareNaver = () => {
    const currentUrl = encodeURIComponent(getShareUrl());
    const shareTitle = encodeURIComponent(title);
    window.open(`https://share.naver.com/web/shareView.nhn?url=${currentUrl}&title=${shareTitle}`, "_blank", "width=600,height=500");
  };

  const handleShareTwitter = () => {
    const currentUrl = encodeURIComponent(getShareUrl());
    const shareText = encodeURIComponent(`${title} | PERVADE`);
    window.open(`https://twitter.com/intent/tweet?text=${shareText}&url=${currentUrl}`, "_blank", "width=600,height=400");
  };

  const handleShareFacebook = () => {
    const currentUrl = encodeURIComponent(getShareUrl());
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`, "_blank", "width=600,height=500");
  };

  const handleNativeOrKakaoShare = async () => {
    const currentUrl = getShareUrl();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text: description || `${title} - 프리미엄 홈케어 퍼베이드`,
          url: currentUrl,
        });
      } catch (e) {
        // Fallback to copy link
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className={`p-4 bg-zinc-50 border rounded-2xl ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white border rounded-lg text-zinc-700 shadow-2xs">
            <Share2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-zinc-900 block">이 콘텐츠 공유하기</span>
            <span className="text-[10px] text-zinc-400">지인이나 SNS에 유용한 정보를 공유해보세요</span>
          </div>
        </div>

        {/* Buttons Grid */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Kakao / Native Share */}
          <button
            type="button"
            onClick={handleNativeOrKakaoShare}
            className="px-3 py-1.5 bg-[#FEE500] hover:bg-[#FDD835] text-[#191919] rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            title="카카오톡 및 모바일 공유"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-[#191919]" />
            카카오톡 공유
          </button>

          {/* Naver Share */}
          <button
            type="button"
            onClick={handleShareNaver}
            className="px-3 py-1.5 bg-[#03C75A] hover:bg-[#02B150] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
            title="네이버 블로그 / 카페 공유"
          >
            <span className="font-black text-xs">N</span>
            네이버
          </button>

          {/* Instagram Share */}
          <button
            type="button"
            onClick={() => {
              handleCopyLink();
              if (/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
                // Open Instagram App on Mobile
                window.location.href = "instagram://app";
                setTimeout(() => {
                  window.open("https://www.instagram.com", "_blank");
                }, 1000);
              } else {
                window.open("https://www.instagram.com", "_blank");
              }
            }}
            className="px-3 py-1.5 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCB045] hover:opacity-90 text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1"
            title="인스타그램 스토리 / 피드 / DM 공유"
          >
            <span className="text-[11px] font-bold">📸 인스타그램</span>
          </button>

          {/* X / Twitter Share */}
          <button
            type="button"
            onClick={handleShareTwitter}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs cursor-pointer"
            title="X (트위터) 공유"
          >
            <span className="font-mono text-xs px-0.5">𝕏</span>
          </button>

          {/* Facebook Share */}
          <button
            type="button"
            onClick={handleShareFacebook}
            className="px-2.5 py-1.5 bg-[#1877F2] hover:bg-[#0C63D4] text-white rounded-xl text-xs font-bold transition-colors shadow-2xs cursor-pointer"
            title="페이스북 공유"
          >
            <span className="font-bold text-xs">f</span>
          </button>

          {/* Copy Link Button */}
          <button
            type="button"
            onClick={handleCopyLink}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
              copied
                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100"
            }`}
            title="URL 링크 복사"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                복사 완료!
              </>
            ) : (
              <>
                <LinkIcon className="w-3.5 h-3.5 text-zinc-500" />
                링크 복사
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
