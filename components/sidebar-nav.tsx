"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FolderKanban, FileText, Users, Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projets", icon: FolderKanban },
  { href: "/posts", label: "Posts", icon: FileText },
  { href: "/crm", label: "CRM", icon: Users },
];

export function SidebarNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <>
      <nav className="flex flex-1 flex-col gap-0.5">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
              isActive(href)
                ? "bg-black/8 dark:bg-white/10 text-foreground font-medium"
                : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-border/50 pt-3 space-y-0.5">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
            isActive("/settings")
              ? "bg-black/8 dark:bg-white/10 text-foreground font-medium"
              : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"
          )}
        >
          <Settings className="h-4 w-4 shrink-0" />
          Paramètres
        </Link>
      </div>
    </>
  );
}
