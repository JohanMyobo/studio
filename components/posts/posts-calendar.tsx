"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Post = {
  id: string;
  title: string;
  platform: string;
  status: string;
  scheduledAt: Date | null;
  publishedAt: Date | null;
  createdAt: Date;
  project: { id: string; name: string };
};

const PLATFORM_EMOJIS: Record<string, string> = {
  linkedin: "💼", twitter: "🐦", instagram: "📸", facebook: "👤", tiktok: "🎵",
};
const STATUS_COLORS: Record<string, string> = {
  draft: "bg-white/10",
  scheduled: "bg-yellow-500/20 border-yellow-500/30",
  published: "bg-emerald-500/20 border-emerald-500/30",
};

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

export function PostsCalendar({ posts }: { posts: Post[] }) {
  const today = new Date();
  const [current, setCurrent] = useState({ year: today.getFullYear(), month: today.getMonth() });

  const firstDay = new Date(current.year, current.month, 1);
  const lastDay = new Date(current.year, current.month + 1, 0);

  // Monday-first offset
  const startOffset = (firstDay.getDay() + 6) % 7;
  const totalCells = startOffset + lastDay.getDate();
  const rows = Math.ceil(totalCells / 7);

  function getPostsForDay(day: number): Post[] {
    return posts.filter((p) => {
      const date = p.scheduledAt ?? p.publishedAt;
      if (!date) return false;
      const d = new Date(date);
      return d.getFullYear() === current.year && d.getMonth() === current.month && d.getDate() === day;
    });
  }

  function prev() {
    setCurrent((c) => c.month === 0 ? { year: c.year - 1, month: 11 } : { ...c, month: c.month - 1 });
  }
  function next() {
    setCurrent((c) => c.month === 11 ? { year: c.year + 1, month: 0 } : { ...c, month: c.month + 1 });
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
      {/* Calendar header */}
      <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
        <h2 className="text-sm font-semibold">
          {MONTHS[current.month]} {current.year}
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={prev}
            className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCurrent({ year: today.getFullYear(), month: today.getMonth() })}
            className="rounded-md px-2.5 py-1 text-xs text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
          >
            Aujourd&apos;hui
          </button>
          <button
            onClick={next}
            className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-white/10 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-border/50">
        {DAYS.map((d) => (
          <div key={d} className="px-3 py-2 text-center text-xs font-medium text-muted-foreground">
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7">
        {Array.from({ length: rows * 7 }).map((_, i) => {
          const day = i - startOffset + 1;
          const isValid = day >= 1 && day <= lastDay.getDate();
          const isToday =
            isValid &&
            day === today.getDate() &&
            current.month === today.getMonth() &&
            current.year === today.getFullYear();
          const dayPosts = isValid ? getPostsForDay(day) : [];

          return (
            <div
              key={i}
              className={`min-h-[90px] border-b border-r border-border/30 p-2 ${
                !isValid ? "bg-white/[0.01]" : ""
              } ${i % 7 === 6 ? "border-r-0" : ""}`}
            >
              {isValid && (
                <>
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                      isToday ? "bg-white text-black" : "text-muted-foreground"
                    }`}
                  >
                    {day}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {dayPosts.slice(0, 3).map((post) => (
                      <Link
                        key={post.id}
                        href={`/posts/${post.id}`}
                        className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-xs border truncate hover:opacity-80 transition-opacity ${
                          STATUS_COLORS[post.status] ?? "bg-white/10"
                        }`}
                      >
                        <span>{PLATFORM_EMOJIS[post.platform] ?? "📝"}</span>
                        <span className="truncate">{post.title}</span>
                      </Link>
                    ))}
                    {dayPosts.length > 3 && (
                      <p className="px-1.5 text-xs text-muted-foreground">+{dayPosts.length - 3}</p>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
