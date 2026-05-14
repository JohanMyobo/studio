import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { getCurrentEntityId, ENTITY_COOKIE } from "@/lib/entity";
import { getEntities } from "@/lib/actions/entities";
import { redirect } from "next/navigation";
import { headers, cookies } from "next/headers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Studio",
  description: "Personal OS for Product Builders",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const isPublicPage = pathname.startsWith("/onboarding") || pathname.startsWith("/login");

  if (!isPublicPage) {
    const entities = await getEntities();
    if (entities.length === 0) {
      redirect("/onboarding");
    } else {
      // Auto-select first entity if no cookie set (e.g. new device/browser)
      const entityId = await getCurrentEntityId();
      if (!entityId) {
        const cookieStore = await cookies();
        cookieStore.set(ENTITY_COOKIE, entities[0].id, {
          path: "/",
          maxAge: 60 * 60 * 24 * 365,
        });
      }
    }
  }

  return (
    <html lang="fr" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <TooltipProvider>
            {isPublicPage ? (
              <>{children}</>
            ) : (
              <div className="flex h-screen overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto bg-background">
                  {children}
                </main>
              </div>
            )}
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
