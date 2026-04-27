import { Suspense } from "react";
import Image from "next/image";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const configured = isSupabaseConfigured();

  if (configured) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      redirect("/dashboard");
    }
  }

  return (
    <main className="min-h-screen bg-background text-white">
      <div className="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
        <section className="flex items-center px-6 py-10 md:px-12">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-10 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-md border border-accent/30 bg-[rgba(206,103,54,0.1)] p-1.5 shadow-[0_0_24px_rgba(206,103,54,0.08)]">
                <Image src="/login-orbit-icon.png" alt="Aphelio Lab" width={34} height={34} className="h-8 w-8 object-contain" />
              </div>
              <div>
                <p className="font-semibold">Aphelio CRM</p>
                <p className="text-sm text-muted">Aphelio Lab</p>
              </div>
            </div>

            <Suspense fallback={<div className="form-panel rounded-lg p-6 text-sm text-muted">Carregando acesso...</div>}>
              <LoginForm configured={configured} />
            </Suspense>
          </div>
        </section>

        <section className="relative hidden overflow-hidden lg:block">
          <Image
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80"
            alt="Painel analitico em uma operacao de dados"
            fill
            sizes="55vw"
            className="object-cover opacity-45"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/35 to-transparent" />
          <div className="absolute bottom-10 left-10 right-10 glass-panel rounded-lg p-6">
            <p className="text-sm uppercase tracking-[0.22em] text-accent">Operacao premium</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight">Leads, reunioes e pipeline no mesmo cockpit.</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted">Acesse seu CRM da Aphelio Lab com autenticacao centralizada e base preparada para multiusuario.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
