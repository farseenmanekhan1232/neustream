"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { time: "00:00", viewers: 0 },
  { time: "00:15", viewers: 200 },
  { time: "00:30", viewers: 1000 },
  { time: "00:45", viewers: 800 },
  { time: "01:00", viewers: 1500 },
  { time: "01:15", viewers: 2000 },
  { time: "01:30", viewers: 2400 },
]

export function StreamPerformance() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Stream Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <XAxis dataKey="time" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
            <Tooltip />
            <Line type="monotone" dataKey="viewers" stroke="#8884d8" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

