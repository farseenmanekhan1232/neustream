import Link from "next/link"
import { Suspense } from "react"
import { RegisterForm } from "@/components/register-form"

// Client component to handle search params
import RegisterFormWithParams from "@/components/register-form-with-params"

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Create an Account</h1>
            <p className="text-muted-foreground">Enter your information to get started</p>
          </div>
          <Suspense fallback={<RegisterForm />}>
            <RegisterFormWithParams />
          </Suspense>
          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

