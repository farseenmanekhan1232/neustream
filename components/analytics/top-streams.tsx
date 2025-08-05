import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const topStreams = [
  { id: 1, title: "Epic Gaming Marathon", viewers: 15000, duration: "8h 30m", date: "2023-06-15" },
  { id: 2, title: "Chill Music Stream", viewers: 8000, duration: "4h 15m", date: "2023-06-14" },
  { id: 3, title: "Coding with Friends", viewers: 5000, duration: "3h 45m", date: "2023-06-13" },
  { id: 4, title: "Art Creation Stream", viewers: 7000, duration: "5h 20m", date: "2023-06-12" },
  { id: 5, title: "Just Chatting", viewers: 10000, duration: "2h 50m", date: "2023-06-11" },
]

export function TopStreams() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Streams</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Viewers</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topStreams.map((stream) => (
              <TableRow key={stream.id}>
                <TableCell>{stream.title}</TableCell>
                <TableCell>{stream.viewers.toLocaleString()}</TableCell>
                <TableCell>{stream.duration}</TableCell>
                <TableCell>{stream.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

