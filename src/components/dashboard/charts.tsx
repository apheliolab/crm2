"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCompact, formatCurrency } from "@/lib/utils";

const grid = "rgba(255,255,255,0.08)";
const muted = "#9f9f9f";
const RADIAN = Math.PI / 180;

type DonutLabelProps = {
  cx?: number | string;
  cy?: number | string;
  midAngle?: number;
  outerRadius?: number | string;
  percent?: number;
  fill?: string;
};

function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return mounted;
}

function ChartSkeleton() {
  return <div className="h-[76%] rounded-md border border-white/10 bg-white/[0.035]" />;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-md border border-white/10 bg-[#080b0f]/95 p-3 shadow-xl">
      <p className="mb-2 text-xs text-muted">{label}</p>
      {payload.map((item) => (
        <div key={item.name} className="flex items-center justify-between gap-6 text-sm">
          <span className="text-muted">{item.name}</span>
          <span className="font-medium text-white">
            {item.name.toLowerCase().includes("revenue") || item.name.toLowerCase().includes("faturamento")
              ? formatCurrency(item.value)
              : formatCompact(item.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

function renderDonutLabel({ cx, cy, midAngle = 0, outerRadius, percent = 0, fill = "#f4f1ea" }: DonutLabelProps) {
  const radius = Number(outerRadius ?? 0) + 18;
  const centerX = Number(cx ?? 0);
  const centerY = Number(cy ?? 0);
  const x = centerX + radius * Math.cos(-midAngle * RADIAN);
  const y = centerY + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill={fill}
      textAnchor={x > centerX ? "start" : "end"}
      dominantBaseline="central"
      className="text-sm font-semibold"
    >
      {Math.round(percent * 100)}%
    </text>
  );
}

export function RevenueAreaChart({
  data,
  title = "Faturamento rastreado",
  description = "Receita atribuida aos canais conectados.",
  showLeads = true,
}: {
  data: { month: string; revenue: number; leads: number }[];
  title?: string;
  description?: string;
  showLeads?: boolean;
}) {
  const mounted = useMounted();

  return (
    <Card className="h-[360px]">
      <CardHeader>
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      {mounted ? (
        <ResponsiveContainer width="100%" height="76%">
          <AreaChart data={data} margin={{ left: -10, right: 8 }}>
            <defs>
              <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ce6736" stopOpacity={0.38} />
                <stop offset="95%" stopColor="#ce6736" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={grid} vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: muted, fontSize: 12 }} />
            <YAxis tickFormatter={formatCompact} tickLine={false} axisLine={false} tick={{ fill: muted, fontSize: 12 }} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="revenue" name="Faturamento" stroke="#ce6736" strokeWidth={3} fill="url(#revenueFill)" />
            {showLeads ? <Line type="monotone" dataKey="leads" name="Leads" stroke="#f4f1ea" strokeWidth={2} dot={false} /> : null}
          </AreaChart>
        </ResponsiveContainer>
      ) : <ChartSkeleton />}
    </Card>
  );
}

export function LeadsBarChart({
  data,
  title = "Leads por canal",
  description = "Distribuicao de aquisicao por origem.",
}: {
  data: { name: string; leads: number; roi?: number; color?: string }[];
  title?: string;
  description?: string;
}) {
  const mounted = useMounted();

  return (
    <Card className="h-[360px]">
      <CardHeader>
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      {mounted ? (
        <ResponsiveContainer width="100%" height="76%">
          <BarChart data={data} margin={{ left: -18, right: 8 }}>
            <CartesianGrid stroke={grid} vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: muted, fontSize: 12 }} />
            <YAxis tickFormatter={formatCompact} tickLine={false} axisLine={false} tick={{ fill: muted, fontSize: 12 }} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="leads" name="Leads" radius={[6, 6, 0, 0]}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color ?? "#ce6736"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : <ChartSkeleton />}
    </Card>
  );
}

export function DonutChart({
  data,
  title,
  description,
}: {
  data: { name: string; value: number; color: string }[];
  title: string;
  description: string;
}) {
  const mounted = useMounted();
  const total = data.reduce((sum, entry) => sum + entry.value, 0);

  return (
    <Card className="h-[360px]">
      <CardHeader>
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <div className="grid h-[75%] grid-cols-1 gap-4 md:grid-cols-[1fr_164px]">
        {mounted ? (
          <div className="relative min-h-[220px] rounded-lg border border-white/10 bg-[#252525] py-2">
            <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#252525] shadow-[inset_0_0_0_2px_rgba(244,241,234,0.08),0_0_0_5px_#151515]" />
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 18, right: 42, bottom: 18, left: 42 }}>
                <Tooltip content={<ChartTooltip />} />
                <Pie
                  data={data}
                  dataKey="value"
                  innerRadius={55}
                  outerRadius={88}
                  paddingAngle={0}
                  startAngle={90}
                  endAngle={-270}
                  stroke="#252525"
                  strokeWidth={3}
                  labelLine={false}
                  label={renderDonutLabel}
                >
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : <ChartSkeleton />}
        <div className="flex flex-col justify-center gap-3">
          {data.map((entry) => (
            <div key={entry.name} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: entry.color }} />
                <span className="truncate text-muted">{entry.name}</span>
              </span>
              <span className="font-medium text-white">{Math.round((entry.value / total) * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export function PerformanceLineChart({
  data,
}: {
  data: { month: string; revenue: number; leads: number }[];
}) {
  const mounted = useMounted();

  return (
    <Card className="h-[320px]">
      <CardHeader>
        <div>
          <CardTitle>Evolucao de performance</CardTitle>
          <CardDescription>Leads e faturamento no periodo selecionado.</CardDescription>
        </div>
      </CardHeader>
      {mounted ? (
        <ResponsiveContainer width="100%" height="74%">
          <LineChart data={data} margin={{ left: -10, right: 8 }}>
            <CartesianGrid stroke={grid} vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: muted, fontSize: 12 }} />
            <YAxis tickFormatter={formatCompact} tickLine={false} axisLine={false} tick={{ fill: muted, fontSize: 12 }} />
            <Tooltip content={<ChartTooltip />} />
            <Line type="monotone" dataKey="revenue" name="Faturamento" stroke="#ce6736" strokeWidth={3} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="leads" name="Leads" stroke="#34d399" strokeWidth={2} dot={{ r: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      ) : <ChartSkeleton />}
    </Card>
  );
}
