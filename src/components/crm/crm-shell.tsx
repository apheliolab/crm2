"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BriefcaseBusiness,
  KanbanSquare,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Settings,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useCrmStore } from "@/hooks/use-crm-store";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clientes", label: "Clientes", icon: BriefcaseBusiness },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/funil", label: "Funil", icon: KanbanSquare },
  { href: "/configuracoes", label: "Configuracoes", icon: Settings },
];

function NavLink({
  href,
  label,
  icon: Icon,
  onClick,
}: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition",
        active
          ? "bg-[linear-gradient(135deg,rgba(255,106,0,0.22),rgba(255,106,0,0.05))] text-white ring-1 ring-[#ff6a00]/30"
          : "text-slate-300 hover:bg-white/6 hover:text-white",
      )}
    >
      <span
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-white/5 transition",
          active && "border-[#ff6a00]/35 bg-[#ff6a00]/12 text-[#ffb36b]",
        )}
      >
        <Icon className="h-4.5 w-4.5" />
      </span>
      <span className="font-medium">{label}</span>
    </Link>
  );
}

export function CrmShell({
  children,
  headerAction,
}: {
  children: React.ReactNode;
  headerAction?: React.ReactNode;
}) {
  const { currentUser, role, signOut, usingSupabase } = useCrmStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const pageTitle = useMemo(() => {
    if (pathname.startsWith("/leads/")) return "Detalhes do Lead";
    const item = navItems.find((entry) => pathname === entry.href || pathname.startsWith(`${entry.href}/`));
    return item?.label ?? "Aphelio CRM";
  }, [pathname]);

  const sidebar = (
    <div className="flex h-full flex-col gap-6 p-5">
      <div className="rounded-xl border border-white/10 bg-[linear-gradient(180deg,rgba(10,16,26,0.96),rgba(6,11,19,0.94))] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
        <div className="flex items-center gap-3">
          <Image src="/logo-simples.png" alt="Aphelio Lab" width={54} height={54} className="h-9 w-9 object-contain" />
          <div>
            <p className="text-sm font-semibold text-white">Aphelio CRM</p>
            <p className="text-xs text-slate-400">Lab comercial e operacao de leads</p>
          </div>
        </div>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink key={item.href} {...item} onClick={() => setMobileOpen(false)} />
        ))}
      </nav>

      <div className="mt-auto rounded-xl border border-[#ff6a00]/22 bg-[linear-gradient(180deg,rgba(38,17,5,0.92),rgba(14,10,14,0.96))] p-5">
        <p className="text-xs uppercase tracking-[0.22em] text-[#ff9d4d]">Operacao</p>
        <h3 className="mt-3 text-lg font-semibold text-white">Responder rapido vende mais</h3>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Organize atendimentos, acompanhe oportunidades e reduza leads esquecidos.
        </p>
      </div>

      {currentUser ? (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-sm font-medium text-white">{currentUser.email}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{role === "admin" ? "Admin" : "Usuario"}</p>
          {usingSupabase ? (
            <Button
              variant="secondary"
              className="mt-4 w-full"
              onClick={() => {
                void signOut();
              }}
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#02050b] text-white">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(255,106,0,0.22),transparent_18%),linear-gradient(180deg,rgba(2,5,11,0.86),rgba(2,5,11,0.98))]" />
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.12]"
        style={{ backgroundImage: "url('/aphelio-background.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}
      />
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-35 [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:44px_44px]" />

      <div className="lg:hidden">
        <div className="sticky top-0 z-40 border-b border-white/10 bg-[#02050b]/88 px-4 py-4 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[#ff9d4d]">Aphelio Lab</p>
              <h1 className="text-lg font-semibold text-white">{pageTitle}</h1>
            </div>
            <Button variant="secondary" size="icon" onClick={() => setMobileOpen((value) => !value)}>
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        {mobileOpen ? (
          <div className="fixed inset-0 z-30 bg-slate-950/70 backdrop-blur-sm">
            <aside className="h-full w-[88%] max-w-sm border-r border-white/10 bg-[#050b14]">{sidebar}</aside>
          </div>
        ) : null}
      </div>

      <div className="grid min-h-screen w-full lg:grid-cols-[320px_minmax(0,1fr)] 2xl:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="hidden border-r border-white/10 bg-[#050b14]/92 backdrop-blur-xl lg:block">{sidebar}</aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-20 hidden border-b border-white/10 bg-[#02050b]/78 px-8 py-5 backdrop-blur-xl lg:block">
            <div className="flex items-center justify-between gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-[#ff9d4d]">Aphelio Lab</p>
                <h1 className="mt-1 text-2xl font-semibold text-white">{pageTitle}</h1>
              </div>
              {headerAction ?? (pathname !== "/dashboard" ? (
                <Link href="/leads" className="inline-flex">
                  <Button size="lg">
                    <Plus className="h-4 w-4" />
                    Novo Lead
                  </Button>
                </Link>
              ) : null)}
            </div>
          </header>

          <main className="px-4 py-5 md:px-6 lg:px-8 2xl:px-10 lg:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
