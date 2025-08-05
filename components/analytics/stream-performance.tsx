"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const data = [
  { name: "1", viewers: 4000, engagement: 2400 },
  { name: "2", viewers: 3000, engagement: 1398 },
  { name: "3", viewers: 2000, engagement: 9800 },
  { name: "4", viewers: 2780, engagement: 3908 },
  { name: "5", viewers: 1890, engagement: 4800 },
  { name: "6", viewers: 2390, engagement: 3800 },
  { name: "7", viewers: 3490, engagement: 4300 },
]

export function StreamPerformance() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Stream Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip />
            <Line type="monotone" dataKey="viewers" stroke="#8884d8" strokeWidth={2} />
            <Line type="monotone" dataKey="engagement" stroke="#82ca9d" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

