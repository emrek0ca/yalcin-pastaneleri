'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { getAssetUrl } from '@/lib/assets';
import { usePathname } from 'next/navigation';
import { ShoppingBag, ChevronDown, Menu, X, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useBranch } from '../context/BranchContext';

export function Navbar() {
  const pathname = usePathname();
  const { totalCount, setIsCartOpen } = useCart();
  const { selectedBranch, setSelectedBranchId, branches } = useBranch();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Ana Sayfa' },
    { href: '/menu', label: 'Menü & Sipariş' },
    { href: '/ozel-pasta', label: 'Özel Gün Pastası' },
    { href: '/subeler', label: 'Şubelerimiz' },
    { href: '/hakkimizda', label: 'Hakkımızda' },
    { href: '/iletisim', label: 'İletişim' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border transition-all">
      {/* Top micro announcement bar */}
      <div className="bg-background-alt border-b border-border/60 text-[11px] py-1.5 px-4 text-center text-secondary flex items-center justify-center gap-3">
        <span className="font-medium text-primary">
          1997’den beri Pastaneci Emine Abla — Osmaniye
        </span>
        <span className="hidden sm:inline-block text-border">/</span>
        <span className="hidden sm:inline-block">
          Sipariş Saatleri: {selectedBranch.orderHours}
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center">
          <img
            src={getAssetUrl('/assets/brand/logo.png')}
            alt="Yalçın Pastaneleri"
            className="h-11 w-auto object-contain"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-7 text-xs tracking-wide uppercase font-semibold">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`py-1 transition-colors ${
                  isActive
                    ? 'text-accent border-b border-accent'
                    : 'text-primary/75 hover:text-primary'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Branch Selector & Cart */}
        <div className="flex items-center gap-3">
          {/* Branch Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
              className="flex items-center gap-1.5 bg-background-alt hover:bg-neutral-100 text-xs font-medium px-3 py-1.5 rounded-md border border-border transition"
              title="Şube Değiştir"
            >
              <span className="text-secondary text-[11px]">Şube:</span>
              <span className="font-semibold text-primary truncate max-w-[110px]">
                {selectedBranch.name.split(' ')[0]}
              </span>
              <ChevronDown className="w-3 h-3 text-secondary ml-0.5" />
            </button>

            {isBranchDropdownOpen && (
              <>
                {/* Backdrop to close on tap outside */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsBranchDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 sm:w-52 bg-white rounded-lg shadow-xl border border-border py-1 z-50 overflow-hidden">
                  {branches.map((b) => {
                    const isSelected = selectedBranch.id === b.id;
                    return (
                      <button
                        key={b.id}
                        onClick={() => {
                          setSelectedBranchId(b.id);
                          setIsBranchDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-neutral-100 text-primary font-bold'
                            : 'text-secondary hover:text-primary hover:bg-neutral-50'
                        }`}
                      >
                        <span className="truncate">{b.name}</span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-accent shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Cart Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center justify-center p-2 rounded-md bg-primary text-white hover:bg-neutral-800 transition"
            aria-label="Sepeti Görüntüle"
          >
            <ShoppingBag className="w-4 h-4" />
            {totalCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-1.5 text-primary hover:text-accent rounded-md"
            aria-label="Menü"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-white px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-sm font-medium ${
                pathname === link.href ? 'bg-neutral-100 text-accent font-semibold' : 'text-primary'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-border">
            <Link
              href="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-1.5 text-xs text-secondary hover:text-primary"
            >
              Yönetici Paneli (Personel)
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
