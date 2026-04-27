# Supabase Setup

## O que preciso que voce me forneca

1. `NEXT_PUBLIC_SUPABASE_URL`
2. `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
3. Confirmacao se eu posso considerar `apheliolab@gmail.com` como o unico admin inicial
4. Acesso ao SQL Editor do projeto Supabase, ou autorizacao para eu te entregar o SQL para voce colar
5. Confirmacao se o deploy na VPS vai usar Docker, PM2 ou `systemd` + Node

## O que NAO vou fazer

- Nao vou hardcodar `apheliolab@gmail.com` / `Euamoanimes12@` no codigo
- Essa senha deve ser criada diretamente no Supabase Auth

## Como criar o admin inicial

1. Crie o usuario no Supabase Auth com email `apheliolab@gmail.com`
2. Defina a senha `Euamoanimes12@` no painel do Supabase
3. Rode o SQL de `supabase/schema.sql`
4. Insira ou atualize a linha do perfil:

```sql
insert into public.profiles (id, email, full_name, role)
select id, email, 'Aphelio Admin', 'admin'::public.app_role
from auth.users
where email = 'apheliolab@gmail.com'
on conflict (id) do update
set email = excluded.email,
    full_name = excluded.full_name,
    role = excluded.role;
```

## Resultado esperado

- `admin`: ve todos os leads e todas as reunioes
- `user`: ve apenas os proprios leads, timeline e reunioes

## Observacao importante

Hoje o CRM ainda usa `localStorage` para os dados funcionais. A autenticacao com Supabase ja pode entrar agora, mas para o comportamento multiusuario real da VPS eu ainda preciso migrar leads, timeline e reunioes para as tabelas do Supabase.

