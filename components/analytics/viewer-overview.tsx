"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

const data = [
  { name: "Mon", viewers: 4000 },
  { name: "Tue", viewers: 3000 },
  { name: "Wed", viewers: 2000 },
  { name: "Thu", viewers: 2780 },
  { name: "Fri", viewers: 1890 },
  { name: "Sat", viewers: 2390 },
  { name: "Sun", viewers: 3490 },
]

export function ViewerOverview() {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Viewer Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Bar dataKey="viewers" fill="#adfa1d" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

