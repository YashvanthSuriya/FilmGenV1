import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isConfigured(value: string | undefined) {
  return Boolean(value && value.trim().length > 0)
}
