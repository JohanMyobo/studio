import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; error?: string }>;
}) {
  const { from, error } = await searchParams;

  async function handleLogin(formData: FormData) {
    "use server";
    const password = formData.get("password") as string;
    const secret = process.env.AUTH_SECRET;
    const authPassword = process.env.AUTH_PASSWORD;

    if (!password || !secret || !authPassword) {
      redirect("/login?error=1");
    }

    if (password !== authPassword) {
      redirect("/login?error=1");
    }

    const cookieStore = await cookies();
    cookieStore.set("studio_auth", secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    redirect(from ?? "/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-3 text-4xl">⚡</div>
          <h1 className="text-2xl font-semibold tracking-tight">Studio</h1>
          <p className="mt-1 text-sm text-muted-foreground">Accès privé</p>
        </div>

        <form action={handleLogin} className="space-y-4">
          <div>
            <input
              type="password"
              name="password"
              placeholder="Mot de passe"
              autoFocus
              autoComplete="current-password"
              required
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-foreground/30 transition-colors"
            />
          </div>

          {error && (
            <p className="text-center text-xs text-red-400">
              Mot de passe incorrect.
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Entrer
          </button>
        </form>
      </div>
    </div>
  );
}
