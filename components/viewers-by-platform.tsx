"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

const data = [
  { name: "Twitch", value: 540, color: "#9146FF" },
  { name: "YouTube", value: 320, color: "#FF0000" },
  { name: "Facebook", value: 210, color: "#1877F2" },
  { name: "Other", value: 75, color: "#6E6E6E" },
]

export function ViewersByPlatform() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} viewers`, "Viewers"]} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

