"use client";

/**
 * Analytics chart components — recharts tabanlı
 * Bar chart: en çok aranan terimler
 * Bar chart: en çok görüntülenen sayfalar
 * Donut chart: triage güven dağılımı
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";

// ─── Arama bar chart ──────────────────────────────────────────────────────────

interface AramaVeri {
  query: string;
  arama_sayisi: number;
}

export function AramaBarChart({ data }: { data: AramaVeri[] }) {
  const slice = data.slice(0, 8).map((d) => ({
    name: d.query.length > 16 ? d.query.slice(0, 16) + "…" : d.query,
    fullName: d.query,
    sayi: d.arama_sayisi,
  }));

  return (
    <div className="h-60 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={slice} layout="vertical" margin={{ left: 0, right: 24, top: 4, bottom: 4 }}>
          <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            width={110}
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 12 }}
            labelStyle={{ color: "#e2e8f0" }}
            formatter={(_val, _name, props) => [_val, (props.payload as { fullName: string }).fullName]}
          />
          <Bar dataKey="sayi" radius={[0, 4, 4, 0]} maxBarSize={18}>
            {slice.map((_, i) => (
              <Cell key={i} fill={i === 0 ? "#e8002d" : i < 3 ? "#f97316" : "#3b82f6"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Sayfa bar chart ──────────────────────────────────────────────────────────

interface SayfaVeri {
  path: string;
  goruntulenme: number;
}

export function SayfaBarChart({ data }: { data: SayfaVeri[] }) {
  const slice = data.slice(0, 8).map((d) => ({
    name: d.path.length > 18 ? d.path.slice(0, 18) + "…" : d.path,
    fullPath: d.path,
    sayi: d.goruntulenme,
  }));

  return (
    <div className="h-60 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={slice} layout="vertical" margin={{ left: 0, right: 24, top: 4, bottom: 4 }}>
          <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            width={120}
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 12 }}
            labelStyle={{ color: "#e2e8f0" }}
            formatter={(_val, _name, props) => [_val, (props.payload as { fullPath: string }).fullPath]}
          />
          <Bar dataKey="sayi" radius={[0, 4, 4, 0]} maxBarSize={18}>
            {slice.map((_, i) => (
              <Cell key={i} fill={i === 0 ? "#10b981" : i < 3 ? "#34d399" : "#6ee7b7"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Triage güven donut ───────────────────────────────────────────────────────

interface TriajGuvenVeri {
  confidence: string;
  sayisi: number;
}

const GUVEN_RENKLER: Record<string, string> = {
  HIGH: "#10b981",
  MEDIUM: "#f59e0b",
  LOW: "#64748b",
  NONE: "#1e293b",
};

const GUVEN_ETIKETLER: Record<string, string> = {
  HIGH: "Yüksek",
  MEDIUM: "Orta",
  LOW: "Düşük",
  NONE: "Yok",
};

export function TriajGuvenDonut({ data }: { data: TriajGuvenVeri[] }) {
  // group by confidence
  const map = new Map<string, number>();
  for (const d of data) {
    map.set(d.confidence, (map.get(d.confidence) ?? 0) + d.sayisi);
  }
  const pie = [...map.entries()].map(([k, v]) => ({
    name: GUVEN_ETIKETLER[k] ?? k,
    value: v,
    color: GUVEN_RENKLER[k] ?? "#475569",
  }));

  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pie}
            cx="50%"
            cy="45%"
            innerRadius={52}
            outerRadius={76}
            paddingAngle={3}
            dataKey="value"
          >
            {pie.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 12 }}
            formatter={(_val, name) => [_val, name]}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => <span style={{ color: "#94a3b8", fontSize: 12 }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
