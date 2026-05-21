import { Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Link } from "react-router-dom";
import { getProfileImageUrl, cn } from "@/lib/utils";
import { useIsOnline } from "@/hooks/useIsOnline";
import type { UserType } from "@/types";
import { useFormatNumber } from "@/hooks/useFormatNumber";
import { useCheckFriendShipStatus } from "@/lib/apis/queries";
import FriendshipButton from "../Profile/FriendshipButton";

export default function SuggestionCard({
  user,
}: {
  user: UserType & { mutualFriendsCount?: number };
}) {
  const isOnline = useIsOnline(user?._id);
  const initials = user?.username?.slice(0, 2).toUpperCase() ?? user?.fName?.slice(0, 2).toUpperCase();
  const mutualFriendsCount = useFormatNumber(user?.mutualFriendsCount!);
  const { data: friendship } = useCheckFriendShipStatus(user?._id);

  return (
    <div className="group flex items-center gap-3 py-2.5 px-2 rounded-xl hover:bg-primary/8 transition-colors duration-200">
      <Link to={`/profile/${user?._id}`} className="shrink-0">
        <div
          className={cn(
            "p-0.5 rounded-full transition-all duration-300",
            isOnline
              ? "bg-linear-to-br from-emerald-400 to-green-500 shadow-[0_0_10px_#22c55e44]"
              : "bg-border-strong",
          )}
        >
          <Avatar className="w-9 h-9 border-2 border-card">
            <AvatarImage
              src={getProfileImageUrl(user?.profileImage)}
              alt={user?.username}
              className="object-cover"
            />
            <AvatarFallback className="text-white text-xs font-bold bg-linear-[135deg] from-primary to-accent">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </Link>

      <Link to={`/profile/${user?._id}`} className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-foreground truncate capitalize group-hover:text-primary transition-colors duration-200">
          {user?.username}
        </p>
        {(user?.mutualFriendsCount ?? 0) > 0 ? (
          <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
            <Users size={10} className="text-primary/60 shrink-0" />
            {mutualFriendsCount} mutual
          </p>
        ) : (
          <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
            {isOnline ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                Online now
              </>
            ) : (
              "Suggested for you"
            )}
          </p>
        )}
      </Link>

      {/* Friendship button — compact icon mode */}
      <div className="shrink-0" onClick={(e) => e.preventDefault()}>
        <FriendshipButton
          variant="compact"
          status={friendship?.status ?? "none"}
          requestId={friendship?.requestId ?? ""}
          userId={user._id}
        />
      </div>
    </div>
  );
}
