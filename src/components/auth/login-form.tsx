"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, ArrowRight, CheckCircle2, LoaderCircle, LockKeyhole, UserPlus2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type LoginFormProps = {
  configured?: boolean;
};

type AuthMode = "login" | "register";

type FormState = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const initialFormState: FormState = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

function ModeButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 rounded-md px-4 py-3 text-sm font-medium transition",
        active
          ? "bg-[linear-gradient(135deg,rgba(255,106,0,0.2),rgba(255,106,0,0.06))] text-white ring-1 ring-[#ff6a00]/28"
          : "text-slate-300 hover:bg-white/[0.05] hover:text-white",
      )}
    >
      {label}
    </button>
  );
}

export function LoginForm({ configured = true }: LoginFormProps) {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<AuthMode>("login");
  const [form, setForm] = useState<FormState>(initialFormState);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const nextPath = searchParams.get("next") || "/dashboard";

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleLogin() {
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: form.email.trim().toLowerCase(),
      password: form.password,
    });

    if (signInError) {
      setError(signInError.message);
      return;
    }

    await supabase.auth.getSession();
    window.location.assign(nextPath);
  }

  async function handleRegister() {
    const normalizedEmail = form.email.trim().toLowerCase();

    if (!form.name.trim()) {
      setError("Informe o nome para criar a conta.");
      return;
    }

    if (!normalizedEmail) {
      setError("Informe um email valido.");
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(form.password)) {
      setError("Use ao menos 8 caracteres com maiuscula, minuscula, numero e simbolo.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("As senhas nao conferem.");
      return;
    }

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: form.password,
      options: {
        data: {
          name: form.name.trim(),
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.session) {
      window.location.assign(nextPath);
      return;
    }

    setMessage("Conta criada com sucesso. Verifique seu email para confirmar o acesso e depois entre no CRM.");
    setMode("login");
    setForm((current) => ({
      ...current,
      email: normalizedEmail,
      password: "",
      confirmPassword: "",
    }));
  }

  return (
    <div className="form-panel rounded-lg p-6">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.22em] text-accent">Acesso seguro</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          {mode === "login" ? "Entrar no Aphelio CRM" : "Criar conta no Aphelio CRM"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          {mode === "login"
            ? "Use suas credenciais do Supabase Auth para acessar seu ambiente."
            : "Cadastre um novo usuario para trabalhar no proprio CRM com autenticacao centralizada."}
        </p>
      </div>

      <div className="mb-5 flex rounded-lg border border-white/10 bg-white/[0.03] p-1">
        <ModeButton
          active={mode === "login"}
          label="Entrar"
          onClick={() => {
            setMode("login");
            setError(null);
            setMessage(null);
          }}
        />
        <ModeButton
          active={mode === "register"}
          label="Criar conta"
          onClick={() => {
            setMode("register");
            setError(null);
            setMessage(null);
          }}
        />
      </div>

      <form
        className="grid gap-3"
        onSubmit={async (event) => {
          event.preventDefault();
          setError(null);
          setMessage(null);

          if (!configured) {
            setError("O ambiente de autenticacao ainda nao foi conectado no servidor.");
            return;
          }

          setLoading(true);

          try {
            if (mode === "login") {
              await handleLogin();
            } else {
              await handleRegister();
            }
          } catch (caughtError) {
            setError(caughtError instanceof Error ? caughtError.message : "Nao foi possivel concluir a autenticacao.");
          } finally {
            setLoading(false);
          }
        }}
      >
        {mode === "register" ? (
          <label className="grid gap-2 text-sm">
            Nome
            <Input value={form.name} onChange={(event) => updateField("name", event.target.value)} required />
          </label>
        ) : null}

        <label className="grid gap-2 text-sm">
          Email
          <Input type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} required />
        </label>

        <label className="grid gap-2 text-sm">
          Senha
          <Input type="password" value={form.password} onChange={(event) => updateField("password", event.target.value)} required />
        </label>

        {mode === "register" ? (
          <label className="grid gap-2 text-sm">
            Confirmar senha
            <Input
              type="password"
              value={form.confirmPassword}
              onChange={(event) => updateField("confirmPassword", event.target.value)}
              required
            />
          </label>
        ) : null}

        {!configured ? (
          <div className="rounded-md border border-[#d97706]/25 bg-[#d97706]/10 p-3 text-sm text-[#ffd7a0]">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-medium text-[#ffe3bd]">Ambiente ainda nao conectado</p>
                <p className="mt-1 text-[#ffd7a0]">
                  As credenciais do Supabase ainda nao foram carregadas neste deploy. Assim que forem aplicadas, login e cadastro passam a funcionar normalmente.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-md border border-[#8f2531]/30 bg-[#8f2531]/12 p-3 text-sm text-[#ffb8c0]">{error}</div>
        ) : null}

        {message ? (
          <div className="rounded-md border border-emerald-400/20 bg-emerald-500/10 p-3 text-sm text-emerald-100">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
              <div>{message}</div>
            </div>
          </div>
        ) : null}

        <Button type="submit" size="lg" className="mt-2" disabled={loading || !configured}>
          {loading ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : mode === "login" ? (
            <ArrowRight className="h-4 w-4" />
          ) : (
            <UserPlus2 className="h-4 w-4" />
          )}
          {mode === "login" ? "Entrar no CRM" : "Criar conta"}
        </Button>
      </form>

      {mode === "register" ? (
        <p className="mt-4 text-xs leading-6 text-slate-400">
          Novas contas entram como <span className="text-white">usuario</span>. O perfil <span className="text-white">admin</span> e gerenciado separadamente no Supabase.
        </p>
      ) : null}

      <div className="mt-6 flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.045] p-3 text-xs text-muted">
        <LockKeyhole className="h-4 w-4 text-accent" />
        Sessao protegida por Supabase Auth e pronta para perfis `admin` e `user`.
      </div>
    </div>
  );
}
