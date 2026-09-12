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
    <div className={`pt-4 flex flex-wrap items-center justify-end gap-3 text-[11px] text-zinc-400 font-normal ${className}`}>
      <span>이 콘텐츠 공유하기</span>
      <span className="text-zinc-300">·</span>
      <button
        type="button"
        onClick={handleCopyLink}
        className="hover:text-zinc-800 transition-colors cursor-pointer inline-flex items-center gap-1"
      >
        {copied ? (
          <span className="text-zinc-900 font-medium inline-flex items-center gap-1">
            <Check className="w-3 h-3" /> 복사됨
          </span>
        ) : (
          "링크 복사"
        )}
      </button>
      <span className="text-zinc-300">·</span>
      <button
        type="button"
        onClick={handleNativeOrKakaoShare}
        className="hover:text-zinc-800 transition-colors cursor-pointer"
      >
        카카오톡
      </button>
      <span className="text-zinc-300">·</span>
      <button
        type="button"
        onClick={handleShareNaver}
        className="hover:text-zinc-800 transition-colors cursor-pointer"
      >
        네이버
      </button>
      <span className="text-zinc-300">·</span>
      <button
        type="button"
        onClick={handleShareTwitter}
        className="hover:text-zinc-800 transition-colors cursor-pointer"
      >
        X
      </button>
      <span className="text-zinc-300">·</span>
      <button
        type="button"
        onClick={handleShareFacebook}
        className="hover:text-zinc-800 transition-colors cursor-pointer"
      >
        페이스북
      </button>
    </div>
  );
}
