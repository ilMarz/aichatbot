import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/app/(auth)/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="min-h-dvh bg-background">
      {/* Top nav */}
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="font-bold text-lg tracking-tight text-foreground"
            >
              tp-ai
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="font-medium text-sm text-muted-foreground">
              Admin
            </span>
          </div>
          <nav className="flex items-center gap-1">
            <Link
              href="/admin/settings"
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              System Prompt
            </Link>
            <Link
              href="/admin/users"
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              Users
            </Link>
          </nav>
        </div>
      </header>

      {/* Page content */}
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}
