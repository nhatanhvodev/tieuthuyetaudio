"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";

type TrendRow = {
  day: string;
  events: number;
  activeListeners: number;
};

export function TrendBarChart({ data }: { data: TrendRow[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, left: -12, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={{ stroke: "#e2e8f0" }} />
          <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              borderRadius: "0.75rem",
              border: "1px solid #e2e8f0",
              boxShadow: "0 8px 24px -12px rgba(15,23,42,0.2)",
              fontSize: "0.8rem"
            }}
          />
          <Legend />
          <Bar dataKey="events" name="Sự kiện" fill="#6366f1" radius={[4, 4, 0, 0]} />
          <Bar dataKey="activeListeners" name="Người nghe" fill="#06b6d4" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TrendLineChart({ data }: { data: TrendRow[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 4, left: -12, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={{ stroke: "#e2e8f0" }} />
          <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              borderRadius: "0.75rem",
              border: "1px solid #e2e8f0",
              boxShadow: "0 8px 24px -12px rgba(15,23,42,0.2)",
              fontSize: "0.8rem"
            }}
          />
          <Legend />
          <Line type="monotone" dataKey="events" name="Sự kiện" stroke="#6366f1" strokeWidth={2} dot={{ r: 3, fill: "#6366f1" }} />
          <Line type="monotone" dataKey="activeListeners" name="Người nghe" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3, fill: "#06b6d4" }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
