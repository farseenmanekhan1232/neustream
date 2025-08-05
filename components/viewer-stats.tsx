"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { name: "Mon", viewers: 4000 },
  { name: "Tue", viewers: 3000 },
  { name: "Wed", viewers: 2000 },
  { name: "Thu", viewers: 2780 },
  { name: "Fri", viewers: 1890 },
  { name: "Sat", viewers: 2390 },
  { name: "Sun", viewers: 3490 },
]

export function ViewerStats() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Viewer Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
            <Tooltip />
            <Bar dataKey="viewers" fill="#8884d8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

