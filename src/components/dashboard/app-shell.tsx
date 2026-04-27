"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BriefcaseBusiness,
  ChevronRight,
  Gauge,
  Megaphone,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  Share2,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { clients } from "@/lib/data";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: Gauge },
  { label: "Fluxo de caixa", href: "/fluxo-caixa", icon: WalletCards },
  { label: "Clientes", href: "/clientes", icon: BriefcaseBusiness },
  { label: "CRM", href: "/crm", icon: UsersRound },
  { label: "Leads", href: "/leads", icon: UsersRound },
  { label: "Relatorios", href: "/relatorios", icon: Share2 },
  { label: "Campanhas", href: "/campanhas", icon: Megaphone },
];

const labels: Record<string, string> = {
  dashboard: "Dashboard",
  "fluxo-caixa": "Fluxo de caixa",
  clientes: "Clientes",
  leads: "Leads",
  relatorios: "Relatorios",
  crm: "CRM",
  campanhas: "Campanhas",
  configuracoes: "Configuracoes",
};

function Breadcrumbs({ pathname }: { pathname: string }) {
  const parts = pathname.split("/").filter(Boolean);

  return (
    <div className="hidden items-center gap-2 text-sm text-muted md:flex">
      <Link href="/dashboard" className="transition hover:text-white">
        Aphelio Hub
      </Link>
      {parts.map((part, index) => {
        const isLast = index === parts.length - 1;
        return (
          <div key={`${part}-${index}`} className="flex items-center gap-2">
            <ChevronRight className="h-3.5 w-3.5 text-white/30" />
            <span className={cn(isLast && "text-white")}>{labels[part] ?? part.replaceAll("-", " ")}</span>
          </div>
        );
      })}
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="fixed inset-0 -z-10 aphelio-grid opacity-35" />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden border-r border-white/10 bg-[#0b0d0f]/95 backdrop-blur-xl transition-all lg:block",
          collapsed ? "w-[84px]" : "w-[280px]",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-20 items-center justify-between px-5">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md border border-accent/30 bg-[rgba(206,103,54,0.16)] p-1.5">
                <Image src="/aphelio-logo.png" alt="Aphelio Lab" width={28} height={28} className="h-7 w-7 object-contain" />
              </div>
              {!collapsed ? (
                <div>
                  <p className="text-sm font-semibold tracking-wide text-white">Aphelio</p>
                  <p className="text-xs text-muted">Performance Hub</p>
                </div>
              ) : null}
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setCollapsed((value) => !value)}>
              {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </Button>
          </div>

          <nav className="flex-1 space-y-1 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted transition hover:bg-white/[0.06] hover:text-white",
                    active && "bg-accent/12 text-white ring-1 ring-accent/25",
                    collapsed && "justify-center px-0",
                  )}
                >
                  <Icon className={cn("h-4.5 w-4.5", active && "text-accent")} />
                  {!collapsed ? item.label : null}
                </Link>
              );
            })}
          </nav>

          <div className="space-y-2 p-3">
            <Link
              href="/configuracoes"
              className={cn(
                "flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted transition hover:bg-white/[0.06] hover:text-white",
                (pathname === "/configuracoes" || pathname.startsWith("/configuracoes/")) && "bg-accent/12 text-white ring-1 ring-accent/25",
                collapsed && "justify-center px-0",
              )}
            >
              <Settings className={cn("h-4.5 w-4.5", pathname.startsWith("/configuracoes") && "text-accent")} />
              {!collapsed ? "Configuracoes" : null}
            </Link>
            <div className={cn("rounded-lg border border-white/10 bg-white/[0.045] p-4", collapsed && "p-2")}>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white/[0.08] p-1.5">
                  <Image src="/aphelio-logo.png" alt="Aphelio Lab" width={24} height={24} className="h-6 w-6 object-contain" />
                </div>
                {!collapsed ? (
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">Aphelio Lab</p>
                    <p className="truncate text-xs text-muted">Workspace financeiro</p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className={cn("transition-all lg:pl-[280px]", collapsed && "lg:pl-[84px]")}>
        <header className="sticky top-0 z-20 border-b border-white/10 bg-background/82 backdrop-blur-xl">
          <div className="flex min-h-20 flex-col gap-3 px-4 py-4 md:px-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center justify-between gap-3">
              <div>
                <Breadcrumbs pathname={pathname} />
                <div className="mt-2 flex items-center gap-2 lg:hidden">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md border border-accent/30 bg-[rgba(206,103,54,0.16)] p-1.5">
                    <Image src="/aphelio-logo.png" alt="Aphelio Lab" width={24} height={24} className="h-6 w-6 object-contain" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Aphelio Performance Hub</p>
                    <p className="text-xs text-muted">Central de comando</p>
                  </div>
                </div>
              </div>
              <Button variant="secondary" size="sm" className="lg:hidden">
                Menu
              </Button>
            </div>

            <div className="grid gap-2 md:grid-cols-[minmax(220px,1fr)_170px_150px_44px] xl:w-[760px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <Input className="pl-9" placeholder="Buscar cliente, lead, venda..." />
              </div>
              <Select aria-label="Selecionar cliente" defaultValue="all">
                <option value="all">Cliente ativo</option>
                {clients.map((client) => (
                  <option key={client.slug} value={client.slug}>
                    {client.name}
                  </option>
                ))}
              </Select>
              <Select aria-label="Selecionar periodo" defaultValue="30d">
                <option value="7d">7 dias</option>
                <option value="30d">30 dias</option>
                <option value="90d">90 dias</option>
                <option value="ytd">Ano atual</option>
              </Select>
              <Button variant="secondary" size="icon" aria-label="Notificacoes">
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1540px] px-4 py-6 md:px-6 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
