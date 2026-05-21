import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin } from "lucide-react";
import { useCheckFriendShipStatus } from "@/lib/apis/queries";
import FriendshipButton from "@/components/Profile/FriendshipButton";
import { getProfileImageUrl } from "@/lib/utils";
import { useFormatNumber } from "@/hooks/useFormatNumber";
import { useIsOnline } from "@/hooks/useIsOnline";
import { Skeleton } from "@/components/ui/skeleton";
import type { UserType } from "@/types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getCoverGradient(id: string): string {
  const gradients = [
    "linear-gradient(135deg,#7c3aed 0%,#db2777 100%)",
    "linear-gradient(135deg,#0d9488 0%,#7c3aed 100%)",
    "linear-gradient(135deg,#d97706 0%,#db2777 100%)",
    "linear-gradient(135deg,#2563eb 0%,#7c3aed 100%)",
    "linear-gradient(135deg,#16a34a 0%,#0d9488 100%)",
    "linear-gradient(135deg,#dc2626 0%,#d97706 100%)",
    "linear-gradient(135deg,#8b5cf6 0%,#ec4899 100%)",
    "linear-gradient(135deg,#06b6d4 0%,#7c3aed 100%)",
  ];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return gradients[Math.abs(hash) % gradients.length];
}

export function getInitials(user: UserType) {
  if (user.fName && user.lName)
    return (user.fName[0] + user.lName[0]).toUpperCase();
  return user.username?.slice(0, 2).toUpperCase() ?? "??";
}

// ─── Online Dot ───────────────────────────────────────────────────────────────

function OnlineDot() {
  return (
    <span className="absolute bottom-0.5 right-0.5 flex h-3.5 w-3.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70" />
      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-card" />
    </span>
  );
}

// ─── Stats Row ────────────────────────────────────────────────────────────────

function StatsRow({ user }: { user: UserType }) {
  const friendCount = useFormatNumber(user.friends?.length ?? 0);
  const postCount = useFormatNumber(user.posts?.length ?? 0);
  return (
    <div className="flex items-center gap-4 border-t border-border-strong pt-3 mt-auto mb-3">
      <div className="flex flex-col items-center">
        <span className="text-[13px] font-bold text-foreground">{friendCount}</span>
        <span className="text-[10.5px] text-muted-foreground">Friends</span>
      </div>
      <div className="w-px h-6 bg-border-strong" />
      <div className="flex flex-col items-center">
        <span className="text-[13px] font-bold text-foreground">{postCount}</span>
        <span className="text-[10.5px] text-muted-foreground">Posts</span>
      </div>
    </div>
  );
}

// ─── Card Shell (shared layout) ───────────────────────────────────────────────

function PeopleCardShell({
  user,
  badge,
  children,
}: {
  user: UserType;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  const isOnline = useIsOnline(user._id);
  const initials = getInitials(user);

  return (
    <div className="group relative flex flex-col rounded-2xl border border-border-strong bg-card overflow-hidden hover:border-primary/30 hover:shadow-[0_8px_32px_rgba(139,92,246,0.12)] transition-all duration-300">
      {/* Cover */}
      <div
        className="h-20 w-full shrink-0 relative"
        style={{ background: getCoverGradient(user._id) }}
      >
        <div className="absolute inset-0 bg-black/15" />
        {badge && <div className="absolute top-2 right-2">{badge}</div>}
      </div>

      {/* Avatar */}
      <div className="px-4 -mt-7 mb-1">
        <div className="relative w-fit">
          <div
            className={`p-[2.5px] rounded-full w-fit transition-all duration-300 ${
              isOnline
                ? "bg-linear-to-br from-emerald-400 to-green-500 shadow-[0_0_12px_#22c55e55]"
                : "bg-input"
            }`}
          >
            <Avatar className="w-14 h-14 border-[2.5px] border-card">
              <AvatarImage
                src={getProfileImageUrl(user.profileImage)}
                alt={user.username}
                className="object-cover"
              />
              <AvatarFallback className="text-white text-sm font-bold bg-linear-[135deg] from-primary to-accent">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
          {isOnline && <OnlineDot />}
        </div>
      </div>

      {/* Body */}
      <div className="px-4 pb-4 flex flex-col flex-1">{children}</div>
    </div>
  );
}

// ─── Discover Card ────────────────────────────────────────────────────────────

export function DiscoverCard({ user }: { user: UserType }) {
  const navigate = useNavigate();
  const { data: friendship, isLoading: isFriendshipLoading } =
    useCheckFriendShipStatus(user._id);

  return (
    <PeopleCardShell user={user}>
      <div className="flex items-center gap-1 mt-1 mb-0.5">
        <span className="text-[14px] font-bold text-foreground capitalize truncate">
          {user.fName && user.lName
            ? `${user.fName} ${user.lName}`
            : user.username}
        </span>
      </div>
      <span className="text-[12px] text-muted-foreground mb-2">
        @{user.username?.toLowerCase()}
      </span>

      {user.address && (
        <span className="text-[11.5px] text-muted-foreground flex items-center gap-1 mb-2">
          <MapPin size={11} className="text-primary/60 shrink-0" />
          {user.address}
        </span>
      )}

      <StatsRow user={user} />

      <div className="flex items-center gap-2">
        {isFriendshipLoading ? (
          <Skeleton className="flex-1 h-8 rounded-full" />
        ) : (
          <div className="flex-1 min-w-0">
            <FriendshipButton
              status={friendship?.status ?? "none"}
              userId={user._id}
              requestId={friendship?.requestId ?? ""}
              variant="card"
            />
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full border border-border-strong text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/8 px-3 text-[12.5px] font-semibold transition-all cursor-pointer shrink-0"
          onClick={() => navigate(`/profile/${user._id}`)}
        >
          View
        </Button>
      </div>
    </PeopleCardShell>
  );
}


export function RequestCard({
  user,
  requestId,
  type,
}: {
  user: UserType;
  requestId: string;
  type: "received" | "sent";
}) {
  const navigate = useNavigate();

  const badge = (
    <span
      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold backdrop-blur-sm ${
        type === "received"
          ? "bg-primary/85 text-white"
          : "bg-amber-500/85 text-white"
      }`}
    >
      {type === "received" ? "Wants to connect" : "Pending"}
    </span>
  );

  return (
    <PeopleCardShell user={user} badge={badge}>
      <div className="flex items-center gap-1 mt-1 mb-0.5">
        <span className="text-[14px] font-bold text-foreground capitalize truncate">
          {user.fName && user.lName
            ? `${user.fName} ${user.lName}`
            : user.username}
        </span>
      </div>
      <span className="text-[12px] text-muted-foreground mb-2">
        @{user.username?.toLowerCase()}
      </span>

      {user.address && (
        <span className="text-[11.5px] text-muted-foreground flex items-center gap-1 mb-2">
          <MapPin size={11} className="text-primary/60 shrink-0" />
          {user.address}
        </span>
      )}

      <StatsRow user={user} />

      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <FriendshipButton
            status={type === "received" ? "received" : "sent"}
            userId={user._id}
            requestId={requestId}
            variant="card"
          />
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full border border-border-strong text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/8 px-3 text-[12.5px] font-semibold transition-all cursor-pointer shrink-0"
          onClick={() => navigate(`/profile/${user._id}`)}
        >
          View
        </Button>
      </div>
    </PeopleCardShell>
  );
}
