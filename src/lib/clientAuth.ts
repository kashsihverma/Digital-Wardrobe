import { getFirebaseAuth } from "@/lib/firebase"

export async function getAuthHeaders() {
  const auth = await getFirebaseAuth()
  const token = await auth.currentUser?.getIdToken()

  if (!token) {
    throw new Error("Please sign in before saving changes.")
  }

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  }
}
