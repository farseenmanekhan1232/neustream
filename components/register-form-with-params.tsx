"use client"

import { useSearchParams } from "next/navigation"
import { RegisterForm } from "./register-form"

export default function RegisterFormWithParams() {
  const searchParams = useSearchParams()
  const plan = searchParams.get("plan") || "starter"

  return <RegisterForm plan={plan} />
}

