"use client";

import Link from "next/link";
import { Menu, Search, ShoppingBag, User as UserIcon, LogOut, ShieldCheck, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoFont, setLogoFont] = useState<string>("'Inter', sans-serif");
  
  // Top Banner Promo State (from DB Policies)
  const [topBannerText, setTopBannerText] = useState("신규 가입 시 3,000P 적립 & 첫 구매 무료배송");
  const [topBannerEnabled, setTopBannerEnabled] = useState(true);

  // Auth & Cart State
  const [user, setUser] = useState<{ id: string; name: string; email: string; role: string; realNameVerified: boolean } | null>(null);
  const [cartCount, setCartCount] = useState<number>(0);

  // Search Modal State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");

  const checkAuthAndCart = async () => {
    try {
      // 1. Theme
      const themeRes = await fetch("/api/admin/theme");
      if (themeRes.ok) {
        const data = await themeRes.json();
        if (data.LOGO_URL) setLogoUrl(data.LOGO_URL);
        else setLogoUrl(null);
        if (data.LOGO_FONT) setLogoFont(data.LOGO_FONT);
      }

      // 2. Policies (Top Banner)
      const policyRes = await fetch("/api/policies");
      if (policyRes.ok) {
        const pData = await policyRes.json();
        if (pData.TOP_BANNER_TEXT) setTopBannerText(pData.TOP_BANNER_TEXT);
        if (pData.TOP_BANNER_ENABLED !== undefined) setTopBannerEnabled(pData.TOP_BANNER_ENABLED !== "false");
      }

      // 3. Auth
      const authRes = await fetch("/api/auth/me", { 
        cache: "no-store", 
        credentials: "include",
        headers: { "Cache-Control": "no-cache" }
      });
      if (authRes.ok) {
        const authData = await authRes.json();
        if (authData.loggedIn && authData.user) {
          setUser(authData.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }

      // 4. Cart
      const cartRes = await fetch("/api/cart", { 
        cache: "no-store", 
        credentials: "include",
        headers: { "Cache-Control": "no-cache" }
      });
      if (cartRes.ok) {
        const cartData = await cartRes.json();
        setCartCount(Array.isArray(cartData) ? cartData.length : 0);
      }
    } catch (err) {
      console.error("Navbar data fetch error:", err);
    }
  };

  // Re-check auth state on route changes
  useEffect(() => {
    checkAuthAndCart();
  }, [pathname]);

  const handleLogout = async () => {
    if (!confirm("로그아웃(로그오프) 하시겠습니까?")) return;
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setCartCount(0);
      alert("로그아웃되었습니다.");
      window.location.href = "/login";
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchKeyword.trim()) return;
    setIsSearchOpen(false);
    router.push(`/shop?search=${encodeURIComponent(searchKeyword.trim())}`);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {/* Top utility bar */}
        <div className="bg-zinc-950 text-white text-[11px] py-1.5 px-4">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
              {topBannerEnabled && (
                <span className="font-medium text-zinc-300 transition-all">
                  {topBannerText}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              {/* Direct Backoffice Link for Testing */}
              <Link 
                href="/admin" 
                className="px-2.5 py-0.5 bg-amber-400/20 text-amber-300 hover:bg-amber-400/30 rounded font-bold transition-colors flex items-center gap-1 text-[10px]"
                title="통합 백오피스 관리자 콘솔로 이동"
              >
                ⚙️ 백오피스(Admin)
              </Link>
              <span className="text-zinc-700">|</span>

              {user ? (
                <div className="flex items-center gap-3">
                  <span className="text-zinc-200 font-semibold">
                    <strong className="text-white">{user.name}</strong>님
                  </span>
                  {user.realNameVerified && (
                    <span className="bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded text-[9px] font-bold">
                      인증완료
                    </span>
                  )}
                  <Link href="/mypage" className="text-zinc-300 hover:text-white transition-colors font-medium">
                    마이페이지
                  </Link>
                  <button 
                    onClick={handleLogout} 
                    className="text-rose-400 hover:text-rose-300 flex items-center gap-1 font-bold cursor-pointer"
                  >
                    <LogOut className="w-3 h-3" /> 로그오프
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href="/login" className="text-zinc-300 hover:text-white transition-colors">
                    로그인
                  </Link>
                  <span className="text-zinc-600">|</span>
                  <Link href="/signup" className="text-zinc-300 hover:text-white transition-colors font-bold">
                    회원가입
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt="PERVADE Logo" 
                  className="h-8 max-w-[180px] object-contain"
                />
              ) : (
                <span 
                  className="text-2xl font-bold tracking-tight text-foreground transition-all"
                  style={{ fontFamily: logoFont }}
                >
                  PERVADE
                </span>
              )}
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link href="/shop" className="hover:text-primary/80 transition-colors font-semibold">
                Shop
              </Link>
              <Link href="/guide" className="hover:text-primary/80 transition-colors text-amber-600 font-bold">
                사용가이드
              </Link>
              <Link href="/about" className="hover:text-primary/80 transition-colors">
                브랜드 스토리
              </Link>
              <Link href="/journal" className="hover:text-primary/80 transition-colors">
                저널
              </Link>
              <Link href="/faq" className="hover:text-primary/80 transition-colors text-muted-foreground">
                고객센터
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Trigger Button */}
            <button 
              type="button" 
              onClick={() => setIsSearchOpen(true)}
              className="p-2 hover:bg-zinc-100 rounded-full transition-colors relative cursor-pointer"
              title="상품 검색"
            >
              <Search className="w-5 h-5 text-zinc-700" />
            </button>

            {/* Cart with live count badge */}
            <Link href="/cart" className="p-2 hover:bg-zinc-100 rounded-full transition-colors relative" title="장바구니">
              <ShoppingBag className="w-5 h-5 text-zinc-700" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-black text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Auth Capsule & Dynamic Logout Toggle */}
            {user ? (
              <div className="flex items-center gap-1.5">
                <Link 
                  href="/mypage" 
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-full text-xs font-bold transition-colors border border-zinc-200"
                  title="마이페이지 바로가기"
                >
                  <UserIcon className="w-3.5 h-3.5 text-zinc-700" />
                  <span className="max-w-[80px] truncate">{user.name}님</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-full text-xs font-bold transition-all cursor-pointer border border-rose-200"
                  title="로그오프"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>로그오프</span>
                </button>
              </div>
            ) : (
              <Link 
                href="/login" 
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-950 text-white hover:bg-zinc-800 rounded-full text-xs font-bold transition-colors shadow-2xs"
                title="로그인"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>로그인</span>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-muted rounded-md"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-background px-4 pt-2 pb-6 space-y-4 shadow-lg">
            <nav className="flex flex-col space-y-3 text-sm font-medium">
              <Link href="/shop" onClick={() => setIsMenuOpen(false)} className="font-bold text-base">전체 상품</Link>
              <Link href="/guide" onClick={() => setIsMenuOpen(false)} className="text-amber-600 font-bold">사용가이드</Link>
              <Link href="/about" onClick={() => setIsMenuOpen(false)}>브랜드 스토리</Link>
              <Link href="/journal" onClick={() => setIsMenuOpen(false)}>저널</Link>
              <Link href="/faq" onClick={() => setIsMenuOpen(false)}>고객센터 (FAQ)</Link>
              <Link href="/qna" onClick={() => setIsMenuOpen(false)}>1:1 Q&A 문의</Link>
            </nav>
            <div className="pt-4 border-t flex flex-col gap-2">
              {user ? (
                <>
                  <Link href="/mypage" onClick={() => setIsMenuOpen(false)} className="w-full text-center py-2.5 bg-zinc-100 rounded-xl text-xs font-bold">
                    마이페이지 ({user.name}님)
                  </Link>
                  <button onClick={handleLogout} className="w-full text-center py-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center justify-center gap-1">
                    <LogOut className="w-3.5 h-3.5" /> 로그오프
                  </button>
                </>
              ) : (
                <div className="flex gap-2">
                  <Link href="/login" onClick={() => setIsMenuOpen(false)} className="flex-1 text-center py-2.5 bg-black text-white rounded-xl text-xs font-bold">
                    로그인
                  </Link>
                  <Link href="/signup" onClick={() => setIsMenuOpen(false)} className="flex-1 text-center py-2.5 border rounded-xl text-xs font-bold">
                    회원가입
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Global Interactive Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6 relative animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b pb-4">
              <h3 className="font-bold text-lg text-zinc-950 flex items-center gap-2">
                <Search className="w-5 h-5 text-zinc-700" />
                퍼베이드 상품 검색
              </h3>
              <button 
                onClick={() => setIsSearchOpen(false)}
                className="p-1.5 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  autoFocus
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="찾으시는 상품명이나 용도를 입력하세요 (예: 다목적 세정제, 기름때, 리필)"
                  className="w-full pl-12 pr-4 py-4 bg-zinc-50 border rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
                <Search className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>

              {/* Recommended Tags */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">추천 검색어</span>
                <div className="flex flex-wrap gap-2">
                  {["다목적 세정제", "주방 기름때", "욕실 물때", "리필 패키지", "친환경", "무자극"].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setSearchKeyword(tag);
                        setIsSearchOpen(false);
                        router.push(`/shop?search=${encodeURIComponent(tag)}`);
                      }}
                      className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-full text-xs font-semibold transition-colors"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-zinc-950 text-white rounded-xl font-bold text-xs hover:bg-zinc-800 transition-colors shadow-md"
              >
                검색하기
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
