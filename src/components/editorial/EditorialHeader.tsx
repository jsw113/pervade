"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, Search, User, Menu, X, ArrowUpRight } from "lucide-react";

export function EditorialHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-white/90 backdrop-blur-md border-b border-zinc-200/60 py-4 shadow-xs text-zinc-900"
            : "bg-gradient-to-b from-black/50 via-black/20 to-transparent py-6 text-white"
        }`}
      >
        <div className="container mx-auto px-6 max-w-7xl flex items-center justify-between">
          {/* Left: Editorial Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-[13px] tracking-widest font-medium uppercase">
            <Link
              href="/shop"
              className="hover:opacity-60 transition-opacity flex items-center gap-1 group"
            >
              Collection
              <span className="w-1 h-1 rounded-full bg-current opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link
              href="/about"
              className="hover:opacity-60 transition-opacity flex items-center gap-1 group"
            >
              Philosophy
              <span className="w-1 h-1 rounded-full bg-current opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link
              href="/journal"
              className="hover:opacity-60 transition-opacity flex items-center gap-1 group"
            >
              Living Journal
              <span className="w-1 h-1 rounded-full bg-current opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link
              href="/guide"
              className="hover:opacity-60 transition-opacity flex items-center gap-1 group"
            >
              Care Routine
              <span className="w-1 h-1 rounded-full bg-current opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </nav>

          {/* Center: Brand Wordmark */}
          <Link
            href="/editorial-preview"
            className="text-xl sm:text-2xl font-serif tracking-[0.3em] font-light uppercase hover:opacity-80 transition-opacity text-center"
          >
            P E R V A D E
          </Link>

          {/* Right: Quick Action Icons */}
          <div className="flex items-center gap-5 sm:gap-6 text-xs font-light tracking-wider">
            <Link
              href="/shop"
              className="hidden sm:inline-flex items-center gap-1 hover:opacity-60 transition-opacity"
            >
              <Search className="w-4 h-4 stroke-[1.5]" />
            </Link>
            <Link
              href="/login"
              className="hover:opacity-60 transition-opacity hidden sm:inline-flex items-center gap-1"
            >
              <User className="w-4 h-4 stroke-[1.5]" />
            </Link>
            <Link
              href="/cart"
              className="hover:opacity-60 transition-opacity relative flex items-center gap-1.5"
            >
              <ShoppingBag className="w-4 h-4 stroke-[1.5]" />
              <span className="text-[11px] font-mono tracking-tighter">(0)</span>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1 hover:opacity-60 transition-opacity"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-zinc-950 text-white flex flex-col justify-between p-8 pt-28 animate-fadeIn md:hidden">
          <div className="space-y-6 text-2xl font-serif tracking-widest uppercase">
            <div>
              <Link
                href="/shop"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 hover:text-zinc-400 transition-colors"
              >
                Collection
              </Link>
            </div>
            <div>
              <Link
                href="/about"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 hover:text-zinc-400 transition-colors"
              >
                Brand Philosophy
              </Link>
            </div>
            <div>
              <Link
                href="/journal"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 hover:text-zinc-400 transition-colors"
              >
                Living Journal
              </Link>
            </div>
            <div>
              <Link
                href="/guide"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 hover:text-zinc-400 transition-colors"
              >
                Care Routine
              </Link>
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-6 space-y-4 text-xs tracking-widest text-zinc-400">
            <div className="flex justify-between items-center">
              <span>MEMBERSHIP</span>
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-white flex items-center gap-1">
                로그인 / 가입 <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="flex justify-between items-center">
              <span>CUSTOMER CARE</span>
              <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="text-white">
                고객 지원
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
