"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"

export function WaitlistForm() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasJoined, setHasJoined] = useState(false)
  const [error, setError] = useState("")

  // Check localStorage on component mount
  useEffect(() => {
    const joinStatus = localStorage.getItem("neustream_waitlist_joined")
    if (joinStatus === "true") {
      setHasJoined(true)
    }
  }, [])

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Reset error state
    setError("")

    // Validate email
    if (!validateEmail(email)) {
      setError("Please enter a valid email address")
      return
    }

    setIsSubmitting(true)

    try {
      // Create form data for submission
      const formData = new FormData()
      formData.append("entry.401331324", email)

      // Submit to Google Form
      const response = await fetch(
        "https://docs.google.com/forms/u/0/d/e/1FAIpQLSdZcyQXHQo5UYTbfT40lE0PTIe5UuvEQbYE4zZBbrragA8g2Q/formResponse",
        {
          method: "POST",
          body: formData,
          mode: "no-cors", // Google Forms requires no-cors mode
        },
      )

      // Since we're using no-cors, we can't actually check the response status
      // So we'll assume success and store in localStorage
      localStorage.setItem("neustream_waitlist_joined", "true")
      localStorage.setItem("neustream_waitlist_email", email)
      setHasJoined(true)
    } catch (error) {
      console.error("Error submitting form:", error)
      setError("There was an error submitting your request. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto" id="waitlist">
      <CardHeader>
        <CardTitle>Join the Waitlist</CardTitle>
        <CardDescription>
          Be the first to experience our revolutionary computational offloading technology.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasJoined ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">You're on the list!</h3>
            <p className="text-muted-foreground">
              Thank you for joining our waitlist. We'll notify you when early access becomes available.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          </form>
        )}
      </CardContent>
      {!hasJoined && (
        <CardFooter>
          <Button className="w-full" onClick={handleSubmit} disabled={isSubmitting || !email}>
            {isSubmitting ? "Submitting..." : "Join Waitlist"}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

