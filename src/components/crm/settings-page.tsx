"use client";

import { useEffect, useRef, useState } from "react";
import { BellRing, Camera, Database, LoaderCircle, LogOut, Save, ShieldCheck, UserCircle2 } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionIntro } from "@/components/crm/crm-ui";
import { useCrmStore } from "@/hooks/use-crm-store";
import { createClient } from "@/lib/supabase/client";

const ACCOUNT_STORAGE_KEY = "aphelio-crm-account-settings";
const MAX_AVATAR_SIZE_BYTES = 600 * 1024;

type AccountForm = {
  name: string;
  email: string;
  jobTitle: string;
  whatsapp: string;
  avatarUrl: string;
};

const emptyForm: AccountForm = {
  name: "",
  email: "",
  jobTitle: "",
  whatsapp: "",
  avatarUrl: "",
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (!parts.length) return "AL";
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

function readLocalAccountForm() {
  if (typeof window === "undefined") return emptyForm;

  try {
    const stored = window.localStorage.getItem(ACCOUNT_STORAGE_KEY);
    if (!stored) return emptyForm;
    return { ...emptyForm, ...(JSON.parse(stored) as Partial<AccountForm>) };
  } catch {
    return emptyForm;
  }
}

export function SettingsPageContent() {
  const { currentUser, role, signOut, usingSupabase } = useCrmStore();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [form, setForm] = useState<AccountForm>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (usingSupabase && currentUser) {
      setForm({
        name: currentUser.user_metadata?.name ?? currentUser.email?.split("@")[0] ?? "",
        email: currentUser.email ?? "",
        jobTitle: currentUser.user_metadata?.job_title ?? "",
        whatsapp: currentUser.user_metadata?.whatsapp ?? "",
        avatarUrl: currentUser.user_metadata?.avatar_url ?? "",
      });
      return;
    }

    const localData = readLocalAccountForm();
    setForm(localData);
  }, [currentUser, usingSupabase]);

  useEffect(() => {
    if (usingSupabase || typeof window === "undefined") return;
    window.localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(form));
  }, [form, usingSupabase]);

  function updateField<K extends keyof AccountForm>(field: K, value: AccountForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleAvatarFile(file: File) {
    setError(null);
    setMessage(null);

    if (!file.type.startsWith("image/")) {
      setError("Selecione uma imagem valida para a foto de perfil.");
      return;
    }

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      setError("A imagem precisa ter no maximo 600 KB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        updateField("avatarUrl", reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (!form.name.trim()) {
        throw new Error("Informe o nome da conta.");
      }

      if (!usingSupabase) {
        setMessage("Configuracoes da conta salvas localmente.");
        return;
      }

      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          name: form.name.trim(),
          job_title: form.jobTitle.trim(),
          whatsapp: form.whatsapp.trim(),
          avatar_url: form.avatarUrl,
        },
      });

      if (updateError) {
        throw updateError;
      }

      setMessage("Conta atualizada com sucesso.");
      window.location.reload();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Nao foi possivel salvar as configuracoes da conta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <SectionIntro
        eyebrow="Configuracoes"
        title="Conta, seguranca e operacao"
        description="Centralize os dados da conta, personalize o perfil do usuario e mantenha a operacao do CRM pronta para uso comercial."
      />

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="rounded-xl">
          <CardHeader>
            <div>
              <CardTitle>Configuracoes da conta</CardTitle>
              <CardDescription>Edite identidade do usuario, foto de perfil e informacoes exibidas dentro da operacao.</CardDescription>
            </div>
          </CardHeader>

          <div className="grid gap-5">
            <div className="flex flex-col gap-4 rounded-lg border border-white/10 bg-white/[0.03] p-4 md:flex-row md:items-center">
              <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-[#ff6a00]/22 bg-[#ff6a00]/10 text-lg font-semibold text-[#ffd39a]">
                {form.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.avatarUrl} alt="Foto de perfil" className="h-full w-full object-cover" />
                ) : (
                  getInitials(form.name || currentUser?.email || "Aphelio Lab")
                )}
              </div>

              <div className="flex-1">
                <p className="text-sm font-medium text-white">Foto de perfil</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Use uma imagem leve para identificar rapidamente o responsavel dentro do CRM.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      inputRef.current?.click();
                    }}
                  >
                    <Camera className="h-4 w-4" />
                    Alterar foto
                  </Button>
                  {form.avatarUrl ? (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        updateField("avatarUrl", "");
                      }}
                    >
                      Remover foto
                    </Button>
                  ) : null}
                </div>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      void handleAvatarFile(file);
                    }
                    event.currentTarget.value = "";
                  }}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm text-slate-200">
                Nome
                <Input value={form.name} onChange={(event) => updateField("name", event.target.value)} required />
              </label>
              <label className="grid gap-2 text-sm text-slate-200">
                Email
                <Input value={form.email} disabled readOnly />
              </label>
              <label className="grid gap-2 text-sm text-slate-200">
                Cargo ou funcao
                <Input value={form.jobTitle} onChange={(event) => updateField("jobTitle", event.target.value)} placeholder="Ex.: SDR, closer, gestor" />
              </label>
              <label className="grid gap-2 text-sm text-slate-200">
                WhatsApp
                <Input value={form.whatsapp} onChange={(event) => updateField("whatsapp", event.target.value)} placeholder="Ex.: 11999999999" />
              </label>
            </div>

            {error ? (
              <div className="rounded-md border border-[#8f2531]/30 bg-[#8f2531]/12 p-3 text-sm text-[#ffb8c0]">{error}</div>
            ) : null}

            {message ? (
              <div className="rounded-md border border-emerald-400/20 bg-emerald-500/10 p-3 text-sm text-emerald-100">{message}</div>
            ) : null}

            <div className="flex flex-wrap justify-between gap-3">
              <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                Perfil atual: <span className="font-medium text-white">{role === "admin" ? "Admin" : "Usuario"}</span>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" onClick={() => void signOut()}>
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
                <Button onClick={() => void handleSave()} disabled={loading}>
                  {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Salvar conta
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-4">
          <SettingsCard
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Seguranca da autenticacao"
            description="O acesso usa Supabase Auth com perfis separados entre admin e usuarios comuns. O logout tambem fica disponivel nesta tela."
          />
          <SettingsCard
            icon={<BellRing className="h-5 w-5" />}
            title="Preferencias operacionais"
            description="Mantenha nome, cargo e WhatsApp atualizados para dar contexto aos agendamentos, historicos e ownership dos leads."
          />
          <SettingsCard
            icon={<Database className="h-5 w-5" />}
            title="Persistencia de dados"
            description="Leads, timeline e reunioes ja podem operar com Supabase e isolamento por usuario, com leitura ampla para o admin."
          />
          <SettingsCard
            icon={<UserCircle2 className="h-5 w-5" />}
            title="Identidade do usuario"
            description="A foto de perfil e os metadados da conta ajudam a deixar o CRM mais claro para equipes comerciais em crescimento."
          />
        </div>
      </div>
    </div>
  );
}

function SettingsCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="rounded-xl">
      <CardHeader>
        <div className="flex h-12 w-12 items-center justify-center rounded-md border border-[#f5a654]/20 bg-[#f5a654]/10 text-[#ffd39a]">
          {icon}
        </div>
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
    </Card>
  );
}
