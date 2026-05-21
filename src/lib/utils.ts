import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Returns the correct profile image URL.
 * - Google login → profileImage is already a full URL (starts with http)
 * - S3 upload    → profileImage is a key, served via our backend /upload/ route
 */
export function getProfileImageUrl(profileImage?: string): string | undefined {
  if (!profileImage) return undefined;
  if (profileImage.startsWith("http")) return profileImage;
  return `${import.meta.env.VITE_API_BASE_URL}/upload/${profileImage}`;
}
