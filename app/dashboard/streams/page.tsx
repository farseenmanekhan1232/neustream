import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import { StreamsList } from "@/components/streams-list"

export default function StreamsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Streams</h1>
        <Link href="/dashboard/streams/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Stream
          </Button>
        </Link>
      </div>
      <StreamsList />
    </div>
  )
}

