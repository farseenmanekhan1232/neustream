"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  {
    date: "Jan 1",
    hours: 2.5,
  },
  {
    date: "Jan 2",
    hours: 0,
  },
  {
    date: "Jan 3",
    hours: 3.2,
  },
  {
    date: "Jan 4",
    hours: 4.5,
  },
  {
    date: "Jan 5",
    hours: 2.0,
  },
  {
    date: "Jan 6",
    hours: 5.0,
  },
  {
    date: "Jan 7",
    hours: 3.5,
  },
  {
    date: "Jan 8",
    hours: 4.0,
  },
  {
    date: "Jan 9",
    hours: 3.0,
  },
  {
    date: "Jan 10",
    hours: 2.5,
  },
  {
    date: "Jan 11",
    hours: 4.2,
  },
  {
    date: "Jan 12",
    hours: 3.8,
  },
  {
    date: "Jan 13",
    hours: 4.5,
  },
  {
    date: "Jan 14",
    hours: 5.2,
  },
]

export function AnalyticsChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}h`}
        />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="hours"
          stroke="currentColor"
          strokeWidth={2}
          activeDot={{ r: 6 }}
          className="stroke-primary"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

