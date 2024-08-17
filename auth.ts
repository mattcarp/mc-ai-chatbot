import { auth } from "@clerk/nextjs/server";

export const getAuth = auth;

export async function requireAuth() {
  console.log("requireAuth function called");
  const { userId } = auth();
  console.log("User ID from auth():", userId);
  if (!userId) {
    console.log("Unauthorized: No user ID found");
    throw new Error('Unauthorized');
  }
  console.log("User authenticated successfully");
  return { userId };
}

export default auth;