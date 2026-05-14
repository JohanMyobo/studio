import Link from "next/link";
import { headers } from "next/headers";
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Users,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getEntities } from "@/lib/actions/entities";
import { getCurrentEntityId } from "@/lib/entity";
import { EntitySwitcher } from "./entity-switcher";
import { ThemeToggle } from "./theme-toggle";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projets", icon: FolderKanban },
  { href: "/posts", label: "Posts", icon: FileText },
  { href: "/crm", label: "CRM", icon: Users },
];

async function ActiveLink({
  href,
  label,
  icon: Icon,
  pathname,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  pathname: string;
}) {
  const active = pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
        active
          ? "bg-black/8 dark:bg-white/10 text-foreground font-medium"
          : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </Link>
  );
}

export async function Sidebar() {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "/dashboard";

  const [entities, currentEntityId] = await Promise.all([
    getEntities(),
    getCurrentEntityId(),
  ]);

  return (
    <aside className="flex h-screen w-[220px] flex-col border-r border-border/50 bg-sidebar px-3 py-4">
      {/* Entity Switcher */}
      <div className="mb-6">
        <EntitySwitcher entities={entities} currentId={currentEntityId} />
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5">
        {navItems.map(({ href, label, icon }) => (
          <ActiveLink
            key={href}
            href={href}
            label={label}
            icon={icon}
            pathname={pathname}
          />
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-border/50 pt-3 space-y-0.5">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
            pathname === "/settings"
              ? "bg-black/10 dark:bg-white/10 text-foreground font-medium"
              : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"
          )}
        >
          <Settings className="h-4 w-4 shrink-0" />
          Paramètres
        </Link>
        <div className="flex items-center justify-between px-2.5 py-1">
          <span className="text-xs text-muted-foreground">Apparence</span>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
