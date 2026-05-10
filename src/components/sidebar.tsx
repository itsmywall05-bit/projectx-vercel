"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "MODULES", type: "header" as const },
  { href: "/trade-log", icon: "▣", label: "Trade Log" },
  { href: "/products", icon: "◑", label: "Products" },
  { label: "FUTURE", type: "header" as const },
  { href: "#", icon: "◬", label: "Risk Console", disabled: true },
  { href: "#", icon: "◈", label: "Performance Lab", disabled: true },
  { href: "#", icon: "◧", label: "Strategy Vault", disabled: true },
  { href: "#", icon: "◐", label: "Playbook", disabled: true },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-3 left-3 z-50 md:hidden w-8 h-8 flex items-center justify-center rounded border border-border2 bg-bg2 text-muted hover:text-text"
        aria-label="Open menu"
      >
        ☰
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static z-50 top-0 left-0 h-screen w-[214px] min-w-[214px] bg-bg2 border-r border-border flex flex-col transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="px-[18px] pt-5 pb-4 border-b border-border">
          <div className="font-heading font-[800] text-[18px] tracking-tight text-accent">
            project<span className="text-text2 font-normal">X</span>
          </div>
          <div className="text-[8.5px] tracking-[2px] text-muted mt-1">
            MVP — TRADE LOG
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2">
          {NAV_ITEMS.map((item, i) => {
            if (item.type === "header") {
              return (
                <div
                  key={i}
                  className="text-[8px] tracking-[2px] uppercase text-muted2 px-[18px] pt-3 pb-1"
                >
                  {item.label}
                </div>
              );
            }

            const active = pathname === item.href;
            const disabled = "disabled" in item && item.disabled;

            return (
              <Link
                key={item.href}
                href={disabled ? "#" : item.href!}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2 px-[18px] py-[7px] text-[11px] border-l-2 transition-all ${
                  active
                    ? "text-accent border-l-accent bg-accent/[0.06]"
                    : disabled
                    ? "text-muted2 border-l-transparent cursor-not-allowed"
                    : "text-muted border-l-transparent hover:text-text hover:bg-accent/[0.04]"
                }`}
              >
                <span className="w-[14px] text-center text-[12px]">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {disabled && (
                  <span className="text-[8px] px-[5px] py-[1px] rounded-full bg-border2 text-muted">
                    soon
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-[18px] py-3 border-t border-border">
          <div className="flex items-center gap-[6px] text-[9.5px] text-muted">
            <div className="w-[5px] h-[5px] rounded-full bg-teal animate-pulse" />
            <span>v0.1 · mvp</span>
          </div>
        </div>
      </aside>
    </>
  );
}
