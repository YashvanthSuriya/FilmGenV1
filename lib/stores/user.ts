import { create } from "zustand"
import type { CreditTransaction, NotificationItem, PlanTier } from "@/lib/types"

export interface UserStore {
  id: string
  email: string
  displayName: string
  avatarUrl: string
  plan: PlanTier
  credits: number
  creditsHistory: CreditTransaction[]
  notifications: NotificationItem[]
  setDisplayName: (displayName: string) => void
  markNotificationsRead: () => void
}

export const useUserStore = create<UserStore>((set) => ({
  id: "local-user",
  email: "director@studio.com",
  displayName: "Director",
  avatarUrl: "",
  plan: "free",
  credits: 50,
  creditsHistory: [],
  notifications: [
    {
      id: "phase-1",
      title: "Cine Studio foundation ready",
      read: false,
      createdAt: new Date(0).toISOString()
    }
  ],
  setDisplayName: (displayName) => set({ displayName }),
  markNotificationsRead: () =>
    set((state) => ({ notifications: state.notifications.map((item) => ({ ...item, read: true })) }))
}))
