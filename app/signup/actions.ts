'use server'

import { auth } from "@clerk/nextjs"
import { ResultCode, getMessageFromCode } from "@/lib/utils"
import { createAI, deleteAI, updateAI } from "../api/functions"
import { revalidatePath } from "next/cache"

export async function signUp(prevState: any, formData: FormData) {
  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
      return {
        type: 'error',
        resultCode: ResultCode.InvalidSubmission
      }
    }

    // Use Clerk's API to create a new user
    const { createUser } = await import('@clerk/nextjs/server')
    const user = await createUser({
      emailAddress: email,
      password: password,
    })

    if (!user) {
      return {
        type: 'error',
        resultCode: ResultCode.UnknownError
      }
    }

    // Additional logic if needed (e.g., creating an AI assistant for the new user)

    revalidatePath('/')
    return {
      type: 'success',
      resultCode: ResultCode.UserCreated
    }
  } catch (error: any) {
    console.error('Sign up error:', error)
    return {
      type: 'error',
      resultCode: ResultCode.UnknownError
    }
  }
}