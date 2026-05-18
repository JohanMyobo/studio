"use client";

import { useState, useTransition } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { updateProjectTools } from "@/lib/actions/projects";
import { cn } from "@/lib/utils";

const SUGGESTED_TOOLS = [
  // Design
  { name: "Figma", emoji: "🎨" },
  { name: "Framer", emoji: "⚡" },
  { name: "Webflow", emoji: "🌊" },
  { name: "Canva", emoji: "🖼️" },
  // Dev
  { name: "VS Code", emoji: "💻" },
  { name: "GitHub", emoji: "🐙" },
  { name: "Vercel", emoji: "▲" },
  { name: "Supabase", emoji: "⚡" },
  // No-code
  { name: "Bubble", emoji: "🫧" },
  { name: "Notion", emoji: "📓" },
  { name: "Airtable", emoji: "📊" },
  { name: "Make", emoji: "🔧" },
  { name: "Zapier", emoji: "⚡" },
  // AI
  { name: "ChatGPT", emoji: "🤖" },
  { name: "Midjourney", emoji: "🖼️" },
  { name: "Claude", emoji: "✨" },
  // Marketing
  { name: "Buffer", emoji: "📅" },
  { name: "Mailchimp", emoji: "📧" },
  // PM
  { name: "Linear", emoji: "📐" },
  { name: "Jira", emoji: "🟦" },
];

export function ToolsEditor({
  projectId,
  initialTools,
}: {
  projectId: string;
  initialTools: string[];
}) {
  const [tools, setTools] = useState<string[]>(initialTools);
  const [customInput, setCustomInput] = useState("");
  const [saving, startSave] = useTransition();

  function save(next: string[]) {
    startSave(async () => {
      await updateProjectTools(projectId, next);
    });
  }

  function toggle(name: string) {
    const next = tools.includes(name)
      ? tools.filter((t) => t !== name)
      : [...tools, name];
    setTools(next);
    save(next);
  }

  function addCustom() {
    const val = customInput.trim();
    if (!val || tools.includes(val)) { setCustomInput(""); return; }
    const next = [...tools, val];
    setTools(next);
    setCustomInput("");
    save(next);
  }

  function remove(name: string) {
    const next = tools.filter((t) => t !== name);
    setTools(next);
    save(next);
  }

  // Custom tools = tools not in the suggested list
  const customTools = tools.filter(
    (t) => !SUGGESTED_TOOLS.find((s) => s.name === t)
  );

  return (
    <div className="space-y-4">
      {/* Active tools */}
      {tools.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tools.map((tool) => {
            const suggested = SUGGESTED_TOOLS.find((s) => s.name === tool);
            return (
              <span
                key={tool}
                className="flex items-center gap-1.5 rounded-full bg-foreground/10 px-3 py-1 text-xs font-medium"
              >
                {suggested?.emoji && <span>{suggested.emoji}</span>}
                {tool}
                <button
                  onClick={() => remove(tool)}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10 transition-colors"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            );
          })}
          {saving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground self-center" />}
        </div>
      )}

      {/* Suggestions */}
      <div className="flex flex-wrap gap-1.5">
        {SUGGESTED_TOOLS.filter((s) => !tools.includes(s.name)).map((tool) => (
          <button
            key={tool.name}
            onClick={() => toggle(tool.name)}
            className="flex items-center gap-1 rounded-full border border-border/60 px-2.5 py-1 text-xs text-muted-foreground hover:border-border hover:text-foreground transition-colors"
          >
            <span>{tool.emoji}</span>
            {tool.name}
          </button>
        ))}
      </div>

      {/* Custom input */}
      <div className="flex items-center gap-2">
        <input
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addCustom()}
          placeholder="Autre outil…"
          className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs outline-none focus:border-foreground/20 placeholder:text-muted-foreground"
        />
        <button
          onClick={addCustom}
          disabled={!customInput.trim()}
          className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
        >
          <Plus className="h-3 w-3" />
          Ajouter
        </button>
      </div>
    </div>
  );
}
