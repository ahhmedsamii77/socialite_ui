import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import type { UserType } from "@/types";
import { useIsOnline } from "@/hooks/useIsOnline";
import { CircleCheckBig, Users } from "lucide-react";
import { useFormatNumber } from "@/hooks/useFormatNumber";
import { getProfileImageUrl } from "@/lib/utils";

export default function FriendCard({ friend }: { friend: UserType }) {
  const isOnline = useIsOnline(friend._id);
  const initials = friend.username?.slice(0, 2).toUpperCase() ?? "??";
  const mutuals = useFormatNumber(friend.friends?.length || 0);

  return (
    <Link
      to={`/profile/${friend._id}`}
      className="group relative flex flex-col items-center gap-3 p-5 rounded-2xl border border-border-strong
        bg-card hover:border-primary/30 hover:shadow-[0_8px_32px_rgba(139,92,246,0.1)]
        transition-all duration-300 overflow-hidden text-center"
    >
      {isOnline && (
        <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-transparent via-emerald-400 to-transparent" />
      )}

      <div className="relative">
        <div
          className={`p-[2.5px] rounded-full transition-all duration-300 ${isOnline
              ? "bg-linear-to-br from-emerald-400 to-green-500 shadow-[0_0_12px_#22c55e55]"
              : "bg-input"
            }`}
        >
          <Avatar className="w-16 h-16 border-[2.5px] border-card">
            <AvatarImage src={getProfileImageUrl(friend.profileImage)} alt={friend.username} className="object-cover" />
            <AvatarFallback className="text-white text-lg font-bold bg-linear-[135deg] from-primary to-accent">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>

        {isOnline && (
          <span className="absolute bottom-0.5 right-0.5 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-card" />
          </span>
        )}
      </div>

      <div className="w-full min-w-0">
        <div className="flex items-center justify-center gap-1 mb-0.5">
          <span className="text-[14px] font-bold text-foreground capitalize truncate group-hover:text-primary transition-colors duration-200">
            {friend.username}
          </span>
          <CircleCheckBig className="text-primary shrink-0" size={13} />
        </div>
        <p className="text-[12px] text-muted-foreground truncate">
          @{friend.username?.replace(/\s+/g, "").toLowerCase()}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-between w-full mt-auto pt-3 border-t border-border-strong/60 gap-2">
        <span
          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${isOnline
              ? "bg-emerald-500/10 text-emerald-500"
              : "bg-muted/50 text-muted-foreground"
            }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-emerald-500" : "bg-muted-foreground/40"
              }`}
          />
          {isOnline ? "Online" : "Offline"}
        </span>

        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
          <Users size={11} className="text-primary/60" />
          {mutuals} friends
        </span>
      </div>
    </Link>
  );
}
