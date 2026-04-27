export function SupabaseSetupPanel() {
  return (
    <div className="form-panel rounded-lg p-6">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.22em] text-accent">Configurar Supabase</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Falta conectar o ambiente de autenticacao</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          A tela de login real ja esta pronta, mas o projeto ainda precisa das variaveis e do banco configurados.
        </p>
      </div>

      <div className="grid gap-3 text-sm text-slate-200">
        <div className="rounded-md border border-white/10 bg-white/[0.04] p-4">
          <p className="font-medium text-white">Variaveis obrigatorias</p>
          <p className="mt-2 text-slate-300">`NEXT_PUBLIC_SUPABASE_URL`</p>
          <p className="mt-1 text-slate-300">`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`</p>
        </div>

        <div className="rounded-md border border-white/10 bg-white/[0.04] p-4">
          <p className="font-medium text-white">Para finalizar o modelo de admin e usuarios</p>
          <p className="mt-2 text-slate-300">Projeto Supabase criado</p>
          <p className="mt-1 text-slate-300">Acesso ao SQL Editor</p>
          <p className="mt-1 text-slate-300">Definicao de quem sera admin ou user</p>
        </div>
      </div>
    </div>
  );
}

