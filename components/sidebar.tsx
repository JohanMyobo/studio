import { getEntities } from "@/lib/actions/entities";
import { getCurrentEntityId } from "@/lib/entity";
import { EntitySwitcher } from "./entity-switcher";
import { ThemeToggle } from "./theme-toggle";
import { SidebarNav } from "./sidebar-nav";

export async function Sidebar() {
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

      {/* Nav + Settings + Apparence — client component for live active state */}
      <SidebarNav />

      {/* Apparence */}
      <div className="px-2.5 py-1 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Apparence</span>
        <ThemeToggle />
      </div>
    </aside>
  );
}
