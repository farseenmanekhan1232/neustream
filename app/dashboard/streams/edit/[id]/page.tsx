import { StreamForm } from "@/components/stream-form"

// This is a mock function to simulate fetching stream data
async function getStreamData(id: string) {
  // In a real application, you would fetch this data from your API
  return {
    id,
    title: "Mock Stream",
    platform: "twitch",
    scheduledFor: "2023-06-25T20:00",
    description: "This is a mock stream for testing purposes.",
  }
}

export default async function EditStreamPage({ params }: { params: { id: string } }) {
  const streamData = await getStreamData(params.id)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Edit Stream</h1>
      <StreamForm streamData={streamData} />
    </div>
  )
}

