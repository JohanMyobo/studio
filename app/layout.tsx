import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { getCurrentEntityId } from "@/lib/entity";
import { getEntities } from "@/lib/actions/entities";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

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
  const isOnboarding = pathname.startsWith("/onboarding");

  if (!isOnboarding) {
    const entities = await getEntities();
    if (entities.length === 0) redirect("/onboarding");
  }

  return (
    <html lang="fr" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <TooltipProvider>
            {isOnboarding ? (
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
