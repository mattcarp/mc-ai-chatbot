import { auth } from "@clerk/nextjs/server";

export const getAuth = auth;

export async function requireAuth() {
  const { userId } = auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }
  return { userId };
}

export default auth;