"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatAngka, formatRupiah, formatRupiahRingkas } from "@/lib/format";

/* Token warna brand (design system bagian 1) */
const WARNA_SERI = ["#C85A32", "#2E4A3E", "#E2A03F"];

type TipeFormat = "angka" | "rupiah" | "rupiah-ringkas";

export type ChartTitik = { label: string } & Record<string, string | number>;

export type ChartSeri = {
  key: string;
  nama: string;
};

function buatFormatter(format: TipeFormat, ringkas = false) {
  if (format === "rupiah") return ringkas ? formatRupiahRingkas : formatRupiah;
  return formatAngka;
}

export function ChartTren({
  data,
  seri,
  format = "angka",
  tinggi = 280,
}: {
  data: ChartTitik[];
  seri: ChartSeri[];
  format?: TipeFormat;
  tinggi?: number;
}) {
  const formatSumbu = buatFormatter(format, true);
  const formatTooltip = buatFormatter(format);

  return (
    <div style={{ height: tinggi }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            {seri.map((item, index) => (
              <linearGradient
                key={item.key}
                id={`gradien-${item.key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={WARNA_SERI[index % WARNA_SERI.length]} stopOpacity={0.2} />
                <stop
                  offset="100%"
                  stopColor={WARNA_SERI[index % WARNA_SERI.length]}
                  stopOpacity={0}
                />
              </linearGradient>
            ))}
          </defs>

          <CartesianGrid vertical={false} stroke="#F3F4F6" />

          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            tick={{ fontSize: 12, fill: "#6B7280" }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={56}
            tick={{ fontSize: 12, fill: "#6B7280" }}
            tickFormatter={(value: number) => formatSumbu(value)}
          />

          <Tooltip
            cursor={{ stroke: "#E5E7EB", strokeWidth: 1 }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #E5E7EB",
              boxShadow: "0 6px 20px rgba(26,26,26,.08)",
              fontSize: 13,
              padding: "10px 12px",
            }}
            labelStyle={{ color: "#1A1A1A", fontWeight: 600, marginBottom: 4 }}
            formatter={(value, name) => [formatTooltip(Number(value)), String(name)]}
          />

          {seri.map((item, index) => (
            <Area
              key={item.key}
              type="monotone"
              dataKey={item.key}
              name={item.nama}
              stroke={WARNA_SERI[index % WARNA_SERI.length]}
              strokeWidth={2}
              fill={`url(#gradien-${item.key})`}
              activeDot={{ r: 4 }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
