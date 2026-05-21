import {
  format,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
} from "date-fns";

export function useFormatDate(createdAt: string | Date) {
  const now = new Date();
  const postDate = new Date(createdAt);

  const diffMinutes = differenceInMinutes(now, postDate);
  const diffHours = differenceInHours(now, postDate);
  const diffDays = differenceInDays(now, postDate);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60)
    return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

  return format(postDate, "dd MMM yyyy");
}
