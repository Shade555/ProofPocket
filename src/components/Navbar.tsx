"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, Settings, FolderCheck, Sparkles } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [modelLabel, setModelLabel] = useState<string>("Gemma 2 (Checking...)");
  const [isDemo, setIsDemo] = useState<boolean>(true);

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        if (data.integrations?.inference) {
          setIsDemo(data.integrations.inference.isDemoMode);
          setModelLabel(
            data.integrations.inference.isDemoMode
              ? "Demo Mode (Synthetic)"
              : data.integrations.inference.modelName || "Gemma 2 9B"
          );
        }
      })
      .catch(() => {
        setIsDemo(true);
        setModelLabel("Demo Mode (Offline)");
      });
  }, []);

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: FolderCheck },
    { href: "/projects/new", label: "New Application Pack", icon: Plus },
    { href: "/settings", label: "Settings & Privacy", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-charcoal-200/80 bg-canvas/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-charcoal-900 text-canvas flex items-center justify-center font-serif font-bold text-lg shadow-sm group-hover:bg-sage-700 transition-colors">
              P
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-lg text-charcoal-900 tracking-tight leading-none group-hover:text-sage-800 transition-colors">
                ProofPocket
              </span>
              <span className="text-[11px] text-charcoal-500 font-sans tracking-wide">
                Open-Weight AI Agent
              </span>
            </div>
          </Link>

          {/* Model Status Pill */}
          <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs border border-charcoal-200 bg-paper">
            <Sparkles className="w-3.5 h-3.5 text-sage-600" />
            <span className="text-charcoal-500 font-medium">Model:</span>
            <span
              className={`font-mono text-[11px] ${
                isDemo ? "text-amber-700 font-semibold" : "text-sage-700 font-semibold"
              }`}
            >
              {modelLabel}
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex items-center space-x-1 sm:space-x-3">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-charcoal-900 text-paper shadow-sm"
                    : "text-charcoal-600 hover:text-charcoal-900 hover:bg-charcoal-100/70"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
