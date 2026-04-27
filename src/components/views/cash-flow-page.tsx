"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Landmark,
  Plus,
  Receipt,
  Repeat,
  WalletCards,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DonutChart } from "@/components/dashboard/charts";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { MotionPanel } from "@/components/dashboard/motion-panel";
import { SectionHeader } from "@/components/dashboard/section-header";
import { DataTable } from "@/components/dashboard/shared";
import { cashFlowCategories, cashFlowTransactions, type CashFlowTransaction } from "@/lib/data";
import { cn, formatCurrency } from "@/lib/utils";

type ExpenseForm = {
  description: string;
  category: string;
  amount: string;
  dueDate: string;
  recurrence: "Fixa" | "Variavel";
  frequency: string;
  costCenter: string;
  paymentMethod: string;
  competence: string;
  sendToSheet: boolean;
  notes: string;
};

const initialExpense: ExpenseForm = {
  description: "",
  category: "Operacao",
  amount: "",
  dueDate: "2026-04-30",
  recurrence: "Variavel",
  frequency: "Unica",
  costCenter: "Operacao",
  paymentMethod: "Pix",
  competence: "Abril/2026",
  sendToSheet: true,
  notes: "",
};

const statusVariant: Record<CashFlowTransaction["status"], "success" | "warning" | "neutral"> = {
  Pago: "success",
  Pendente: "warning",
  Agendado: "neutral",
};

const categoryColors = ["#ce6736", "#f4f1ea", "#22c55e", "#9f9f9f", "#e7e2d8", "#a63f24"];

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(`${date}T12:00:00`));
}

function buildExpenseBreakdown(transactions: CashFlowTransaction[]) {
  const grouped = transactions
    .filter((transaction) => transaction.type === "Saida")
    .reduce<Record<string, number>>((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] ?? 0) + transaction.amount;
      return acc;
    }, {});

  return Object.entries(grouped).map(([name, value], index) => ({
    name,
    value,
    color: categoryColors[index % categoryColors.length],
  }));
}

function parseCurrency(value: string) {
  const normalized = value.replace(/\./g, "").replace(",", ".");
  return Number(normalized) || 0;
}

function FloatingExpenseDialog({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (transaction: CashFlowTransaction) => void;
}) {
  const [form, setForm] = useState<ExpenseForm>(initialExpense);

  function update<K extends keyof ExpenseForm>(key: K, value: ExpenseForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const transaction: CashFlowTransaction = {
      id: `CF-${Date.now().toString().slice(-5)}`,
      date: form.dueDate,
      description: form.description || "Nova despesa operacional",
      category: form.category,
      type: "Saida",
      recurrence: form.recurrence,
      amount: parseCurrency(form.amount),
      status: "Pendente",
      destination: form.sendToSheet ? "Planilha" : "Manual",
      paymentMethod: form.paymentMethod,
      costCenter: form.costCenter,
      notes: `${form.frequency} - ${form.competence}${form.notes ? ` | ${form.notes}` : ""}`,
    };

    onSave(transaction);
    setForm(initialExpense);
    onClose();
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(19,19,19,0.88)] p-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.form
            onSubmit={handleSubmit}
            className="form-panel max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-lg p-6"
            initial={{ opacity: 0, y: 22, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.18 }}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">Nova despesa</p>
                <h2 className="mt-2 text-xl font-semibold text-white">Cadastrar lancamento financeiro</h2>
                <p className="mt-1 text-sm text-muted">Classifique a despesa para manter o caixa e a planilha sempre organizados.</p>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Fechar">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm text-muted">Descricao</span>
                <Input value={form.description} onChange={(event) => update("description", event.target.value)} placeholder="Ex: Assinatura CRM" required />
              </label>
              <label className="space-y-2">
                <span className="text-sm text-muted">Categoria</span>
                <Select value={form.category} onChange={(event) => update("category", event.target.value)}>
                  {cashFlowCategories.filter((category) => category !== "Mensalidade cliente").map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </Select>
              </label>
              <label className="space-y-2">
                <span className="text-sm text-muted">Valor</span>
                <Input value={form.amount} onChange={(event) => update("amount", event.target.value)} placeholder="8500,00" inputMode="decimal" required />
              </label>
              <label className="space-y-2">
                <span className="text-sm text-muted">Vencimento</span>
                <Input type="date" value={form.dueDate} onChange={(event) => update("dueDate", event.target.value)} required />
              </label>
              <div className="space-y-2">
                <span className="text-sm text-muted">Tipo de despesa</span>
                <div className="grid grid-cols-2 gap-2">
                  {(["Fixa", "Variavel"] as const).map((recurrence) => (
                    <button
                      key={recurrence}
                      type="button"
                      onClick={() => update("recurrence", recurrence)}
                      className={cn(
                        "h-10 rounded-md border px-3 text-sm font-medium transition",
                        form.recurrence === recurrence
                          ? "border-accent/50 bg-accent/15 text-white"
                          : "border-white/10 bg-white/[0.04] text-muted hover:bg-white/[0.07]",
                      )}
                    >
                      {recurrence}
                    </button>
                  ))}
                </div>
              </div>
              <label className="space-y-2">
                <span className="text-sm text-muted">Frequencia</span>
                <Select value={form.frequency} onChange={(event) => update("frequency", event.target.value)}>
                  <option value="Unica">Unica</option>
                  <option value="Mensal">Mensal</option>
                  <option value="Trimestral">Trimestral</option>
                  <option value="Anual">Anual</option>
                </Select>
              </label>
              <label className="space-y-2">
                <span className="text-sm text-muted">Centro de custo</span>
                <Select value={form.costCenter} onChange={(event) => update("costCenter", event.target.value)}>
                  <option value="Operacao">Operacao</option>
                  <option value="Equipe">Equipe</option>
                  <option value="Aquisicao">Aquisicao</option>
                  <option value="Tecnologia">Tecnologia</option>
                  <option value="Financeiro">Financeiro</option>
                </Select>
              </label>
              <label className="space-y-2">
                <span className="text-sm text-muted">Forma de pagamento</span>
                <Select value={form.paymentMethod} onChange={(event) => update("paymentMethod", event.target.value)}>
                  <option value="Pix">Pix</option>
                  <option value="Boleto">Boleto</option>
                  <option value="Cartao corporativo">Cartao corporativo</option>
                  <option value="Transferencia">Transferencia</option>
                </Select>
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm text-muted">Competencia</span>
                <Input value={form.competence} onChange={(event) => update("competence", event.target.value)} placeholder="Abril/2026" />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm text-muted">Observacoes</span>
                <Textarea value={form.notes} onChange={(event) => update("notes", event.target.value)} placeholder="Centro de custo, responsavel, justificativa ou regra de recorrencia." />
              </label>
            </div>

            <label className="mt-4 flex items-center gap-3 rounded-md border border-white/10 bg-white/[0.04] p-3 text-sm text-muted">
              <input
                type="checkbox"
                checked={form.sendToSheet}
                onChange={(event) => update("sendToSheet", event.target.checked)}
                className="h-4 w-4 accent-[#ce6736]"
              />
              Enviar este lancamento para a planilha financeira ao salvar
            </label>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
              <Button type="submit"><Plus className="h-4 w-4" /> Salvar despesa</Button>
            </div>
          </motion.form>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function CashFlowPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [manualTransactions, setManualTransactions] = useState<CashFlowTransaction[]>([]);
  const [synced, setSynced] = useState(false);

  const transactions = useMemo(() => [...manualTransactions, ...cashFlowTransactions], [manualTransactions]);
  const expenseChart = useMemo(() => buildExpenseBreakdown(transactions), [transactions]);
  const totals = useMemo(() => {
    const income = transactions.filter((transaction) => transaction.type === "Entrada").reduce((sum, transaction) => sum + transaction.amount, 0);
    const expenses = transactions.filter((transaction) => transaction.type === "Saida").reduce((sum, transaction) => sum + transaction.amount, 0);
    const fixed = transactions.filter((transaction) => transaction.type === "Saida" && transaction.recurrence === "Fixa").reduce((sum, transaction) => sum + transaction.amount, 0);
    const variable = transactions.filter((transaction) => transaction.type === "Saida" && transaction.recurrence === "Variavel").reduce((sum, transaction) => sum + transaction.amount, 0);
    const pending = transactions.filter((transaction) => transaction.status !== "Pago").reduce((sum, transaction) => sum + transaction.amount, 0);

    return { income, expenses, balance: income - expenses, fixed, variable, pending };
  }, [transactions]);

  function handleExportPdf() {
    window.print();
  }

  function handleExportSheet() {
    const headers = ["ID", "Data", "Descricao", "Tipo", "Categoria", "Recorrencia", "Valor", "Status", "Destino", "Pagamento", "Centro de custo", "Observacoes"];
    const rows = transactions.map((transaction) => [
      transaction.id,
      transaction.date,
      transaction.description,
      transaction.type,
      transaction.category,
      transaction.recurrence,
      transaction.amount,
      transaction.status,
      transaction.destination,
      transaction.paymentMethod,
      transaction.costCenter,
      transaction.notes,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(";"))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");

    link.href = url;
    link.download = "aphelio-fluxo-de-caixa.csv";
    link.click();
    URL.revokeObjectURL(url);
    setSynced(true);
  }

  function handleSave(transaction: CashFlowTransaction) {
    setManualTransactions((current) => [transaction, ...current]);
    setSynced(transaction.destination === "Planilha");
  }

  return (
    <div>
      <SectionHeader
        eyebrow="Financeiro"
        title="Fluxo de caixa"
        description="Controle de entradas, despesas fixas, despesas variaveis e exportacao das transacoes para planilha ou PDF."
        action={
          <>
            <Button variant="secondary" onClick={handleExportSheet}><FileSpreadsheet className="h-4 w-4" /> Exportar planilha</Button>
            <Button variant="secondary" onClick={handleExportPdf}><Download className="h-4 w-4" /> Exportar PDF</Button>
            <Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4" /> Nova despesa</Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MotionPanel><KpiCard label="Saldo projetado" value={formatCurrency(totals.balance)} change="Entradas menos saidas" icon={WalletCards} tone={totals.balance >= 0 ? "positive" : "warning"} /></MotionPanel>
        <MotionPanel delay={0.04}><KpiCard label="Entradas" value={formatCurrency(totals.income)} change="Receita e recebiveis" icon={ArrowUpRight} tone="positive" /></MotionPanel>
        <MotionPanel delay={0.08}><KpiCard label="Saidas" value={formatCurrency(totals.expenses)} change="Despesas do periodo" icon={ArrowDownRight} tone="neutral" /></MotionPanel>
        <MotionPanel delay={0.12}><KpiCard label="Pendencias" value={formatCurrency(totals.pending)} change="A pagar ou receber" icon={Landmark} tone="warning" /></MotionPanel>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <DonutChart data={expenseChart} title="Despesas por categoria" description="Distribuicao no estilo de anel para leitura rapida do caixa." />
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Planilha financeira</CardTitle>
              <CardDescription>Lancamentos marcados para sincronizacao ficam prontos para controle externo.</CardDescription>
            </div>
            <Badge variant={synced ? "success" : "neutral"}>{synced ? "Planilha atualizada" : "Aguardando envio"}</Badge>
          </CardHeader>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center gap-2 text-sm text-muted">
                <Repeat className="h-4 w-4 text-accent" />
                Despesas fixas
              </div>
              <p className="mt-3 text-2xl font-semibold text-white">{formatCurrency(totals.fixed)}</p>
              <p className="mt-1 text-xs text-muted">Base recorrente mensal.</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center gap-2 text-sm text-muted">
                <Receipt className="h-4 w-4 text-accent" />
                Despesas variaveis
              </div>
              <p className="mt-3 text-2xl font-semibold text-white">{formatCurrency(totals.variable)}</p>
              <p className="mt-1 text-xs text-muted">Oscilam conforme operacao.</p>
            </div>
          </div>
          <div className="mt-4 rounded-lg border border-accent/25 bg-accent/10 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-accent" />
              <div>
                <p className="font-medium text-white">Saida planejada para controle</p>
                <p className="mt-1 text-sm leading-6 text-muted">
                  O botao de planilha prepara todas as transacoes com data, tipo, categoria, valor, recorrencia, centro de custo e status. O PDF usa a mesma base completa da tabela.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <div>
            <CardTitle>Transacoes do caixa</CardTitle>
            <CardDescription>Entradas, despesas fixas, despesas variaveis e status de pagamento.</CardDescription>
          </div>
          <Button variant="secondary" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4" /> Adicionar despesa</Button>
        </CardHeader>
        <DataTable
          headers={["Data", "Descricao", "Tipo", "Categoria", "Recorrencia", "Valor", "Status", "Destino"]}
          rows={transactions.map((transaction) => [
            formatDate(transaction.date),
            <div key="description">
              <p className="font-medium text-white">{transaction.description}</p>
              <p className="text-xs text-muted">{transaction.costCenter} - {transaction.paymentMethod}</p>
            </div>,
            <Badge key="type" variant={transaction.type === "Entrada" ? "success" : "warning"}>{transaction.type}</Badge>,
            transaction.category,
            <Badge key="recurrence" variant={transaction.recurrence === "Fixa" ? "default" : "neutral"}>{transaction.recurrence}</Badge>,
            <span key="amount" className={cn("font-semibold", transaction.type === "Entrada" ? "text-emerald-200" : "text-[#f0b08d]")}>
              {transaction.type === "Entrada" ? "+" : "-"} {formatCurrency(transaction.amount)}
            </span>,
            <Badge key="status" variant={statusVariant[transaction.status]}>{transaction.status}</Badge>,
            <span key="destination" className="text-white">{transaction.destination}</span>,
          ])}
        />
      </Card>

      <FloatingExpenseDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSave={handleSave} />
    </div>
  );
}
