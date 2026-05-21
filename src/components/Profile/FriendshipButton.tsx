import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { FriendshipStatus } from "@/types";
import {
  UserPlus,
  UserCheck,
  UserX,
  Check,
  X,
  Clock,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { Button } from "../ui/button";
import { useAcceptRequest, useCancelRequest, useRejectRequest, useRemoveFriend, useSendFriendRequest } from "@/lib/apis/queries";
import toast from "react-hot-toast";

export default function FriendshipButton({
  status,
  userId,
  requestId,
  variant = "default",
}: {
  status: FriendshipStatus;
  userId: string;
  requestId: string;
  variant?: "default" | "compact" | "card";
}) {
  const { mutateAsync: removeFriend, isPending: isRemovingFriend } = useRemoveFriend();
  const { mutateAsync: sendFriendRequest, isPending: isSendingFriendRequest } = useSendFriendRequest();
  const { mutateAsync: cancelRequest, isPending: isCancelingRequest } = useCancelRequest();
  const { mutateAsync: acceptRequest, isPending: isAcceptingRequest } = useAcceptRequest();
  const { mutateAsync: rejectRequest, isPending: isRejectingRequest } = useRejectRequest();


  async function handleRemoveFriend() {
    try {
      await removeFriend(userId);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong. Please try again.");
    }
  }
  async function handleSendFriendRequest() {
    try {
      await sendFriendRequest(userId);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong. Please try again.");
    }
  }
  async function handleAcceptRequest() {
    try {
      await acceptRequest(requestId);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong. Please try again.");
    }
  }
  async function handleRejectRequest() {
    try {
      await rejectRequest(requestId);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong. Please try again.");
    }
  }
  async function handleCancelRequest() {
    try {
      await cancelRequest(requestId);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong. Please try again.");
    }
  }
  if (status === "received") {
    if (variant === "compact") {
      return (
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleAcceptRequest}
            disabled={isAcceptingRequest}
            title="Accept"
            className={cn(
              "inline-flex items-center justify-center w-7 h-7 rounded-full",
              "bg-primary/10 text-primary border border-primary/20",
              "hover:bg-primary hover:text-white hover:border-primary",
              "transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none cursor-pointer",
            )}
          >
            {isAcceptingRequest ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
          </button>
          <button
            onClick={handleRejectRequest}
            disabled={isRejectingRequest}
            title="Decline"
            className={cn(
              "inline-flex items-center justify-center w-7 h-7 rounded-full",
              "bg-muted/70 text-muted-foreground border border-input",
              "hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30",
              "transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none cursor-pointer",
            )}
          >
            {isRejectingRequest ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
          </button>
        </div>
      );
    }
    return (
      <div className={cn("flex items-center gap-1.5", variant === "card" && "w-full")}>
        {/* Accept — takes available space */}
        <Button
          onClick={handleAcceptRequest}
          disabled={isAcceptingRequest}
          size={variant === "card" ? "sm" : "default"}
          className={cn(
            "group relative rounded-full font-semibold",
            variant === "card" ? "flex-1 justify-center text-[12px]" : "px-4 py-2 text-[13px] gap-1.5",
            "bg-linear-to-r from-primary to-accent text-white shadow-[0_2px_16px_hsl(var(--primary)/.35)]",
            "transition-all duration-200 hover:shadow-[0_4px_20px_hsl(var(--primary)/.5)] hover:-translate-y-0.5 active:translate-y-0",
            "disabled:opacity-60 disabled:pointer-events-none cursor-pointer",
          )}
        >
          {isAcceptingRequest ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Check size={14} />
          )}
          <span>Accept</span>
        </Button>

        {/* Decline — compact icon pill in card, full button otherwise */}
        {variant === "card" ? (
          <button
            disabled={isRejectingRequest}
            onClick={handleRejectRequest}
            title="Decline"
            className={cn(
              "inline-flex items-center justify-center h-8 w-8 rounded-full shrink-0",
              "bg-muted/60 text-muted-foreground border border-input",
              "hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30",
              "transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none cursor-pointer",
            )}
          >
            {isRejectingRequest ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />}
          </button>
        ) : (
          <Button
            disabled={isRejectingRequest}
            onClick={handleRejectRequest}
            className={cn(
              "rounded-full font-semibold gap-1.5 px-4 py-2 text-[13px]",
              "bg-muted/70 text-muted-foreground border border-input",
              "hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30",
              "transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0",
              "disabled:opacity-60 disabled:pointer-events-none cursor-pointer",
            )}
          >
            {isRejectingRequest ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
            <span>Decline</span>
          </Button>
        )}
      </div>
    );
  }

  if (status === "friends") {
    if (variant === "compact") {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              disabled={isRemovingFriend}
              title="Friends"
              className={cn(
                "inline-flex items-center justify-center w-7 h-7 rounded-full",
                "bg-primary/10 text-primary! border border-primary/30",
                "hover:bg-destructive/10 hover:text-destructive! hover:border-destructive/30",
                "transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none cursor-pointer",
              )}
            >
              {isRemovingFriend
                ? <Loader2 size={12} className="animate-spin" />
                : <UserCheck size={12} />}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 rounded-xl border-input shadow-xl bg-card/95 backdrop-blur-md">
            <DropdownMenuItem
              onClick={handleRemoveFriend}
              className="text-destructive focus:text-destructive focus:bg-destructive/10 rounded-lg cursor-pointer py-2.5 font-medium flex items-center gap-2 transition-colors"
            >
              <UserX size={15} />
              Unfriend
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    // ── card variant ──
    if (variant === "card") {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              disabled={isRemovingFriend}
              className={cn(
                "group relative w-full h-8 rounded-full inline-flex items-center justify-center gap-1.5 text-[12.5px] font-semibold overflow-hidden",
                "bg-primary/10 text-primary border border-primary/30",
                "hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30",
                "transition-all duration-300 disabled:opacity-60 disabled:pointer-events-none cursor-pointer",
              )}
            >
              {isRemovingFriend ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <>
                  <span className="flex items-center gap-1.5 transition-all duration-200 group-hover:opacity-0 group-hover:scale-90 group-hover:absolute">
                    <UserCheck size={13} className="shrink-0" />
                    Friends
                  </span>
                  <span className="flex items-center gap-1.5 opacity-0 scale-90 absolute transition-all duration-200 group-hover:opacity-100 group-hover:scale-100 group-hover:static">
                    <UserX size={13} className="shrink-0" />
                    Unfriend
                  </span>
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-44 rounded-xl border-input shadow-xl bg-card/95 backdrop-blur-md">
            <DropdownMenuItem
              onClick={handleRemoveFriend}
              className="text-destructive focus:text-destructive focus:bg-destructive/10 rounded-lg cursor-pointer py-2.5 font-medium flex items-center gap-2 transition-colors"
            >
              <UserX size={15} />
              Unfriend
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    // ── default variant ──
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            disabled={isRemovingFriend}
            size="default"
            className={cn(
              "group rounded-full font-semibold gap-1.5 px-4! py-2! text-[13px]",
              "bg-primary/10 text-primary border border-primary/30",
              "hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30",
              "transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0",
              "disabled:opacity-60 disabled:pointer-events-none cursor-pointer",
            )}
          >
            {!isRemovingFriend && <UserCheck size={15} className="shrink-0 group-hover:hidden" />}
            {!isRemovingFriend && <UserX size={15} className="shrink-0 hidden group-hover:block" />}
            {isRemovingFriend && <Loader2 size={15} className="animate-spin" />}
            <span className="group-hover:hidden">Friends</span>
            <span className="hidden group-hover:block">Unfriend</span>
            <ChevronDown
              size={13}
              className="opacity-40 ml-0.5 transition-transform duration-200 group-data-[state=open]:rotate-180 group-hover:hidden"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44 rounded-xl border-input shadow-xl bg-card/95 backdrop-blur-md">
          <DropdownMenuItem
            onClick={handleRemoveFriend}
            className="text-destructive focus:text-destructive focus:bg-destructive/10 rounded-lg cursor-pointer py-2.5 font-medium flex items-center gap-2 transition-colors"
          >
            <UserX size={15} />
            Unfriend
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (status === "sent") {
    if (variant === "compact") {
      return (
        <button
          onClick={handleCancelRequest}
          disabled={isCancelingRequest}
          title="Cancel Request"
          className={cn(
            "group inline-flex items-center justify-center w-7 h-7 rounded-full",
            "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25",
            "hover:bg-destructive/10 hover:text-destructive hover:border-destructive/25",
            "transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none cursor-pointer",
          )}
        >
          {isCancelingRequest
            ? <Loader2 size={12} className="animate-spin" />
            : <>
                <Clock size={12} className="group-hover:hidden" />
                <X size={12} className="hidden group-hover:block" />
              </>}
        </button>
      );
    }
    return (
      <Button
        onClick={handleCancelRequest}
        disabled={isCancelingRequest}
        size={variant === "card" ? "sm" : "default"}
        className={cn(
          "group rounded-full font-semibold",
          variant === "card" ? "w-full justify-center text-[12.5px]" : "gap-1.5 px-4 py-2 text-[13px]",
          "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25",
          "hover:bg-destructive/10 hover:text-destructive hover:border-destructive/25",
          "transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0",
          "disabled:opacity-60 disabled:pointer-events-none cursor-pointer",
        )}
      >
        {isCancelingRequest ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <>
            <Clock size={14} className="shrink-0 group-hover:hidden" />
            <UserX size={14} className="shrink-0 hidden group-hover:block" />
          </>
        )}
        <span className={isCancelingRequest ? "hidden" : "group-hover:hidden"}>Requested</span>
        <span className={isCancelingRequest ? "block" : "hidden group-hover:block"}>Cancel</span>
      </Button>
    );
  }

  if (variant === "compact") {
    return (
      <button
        disabled={isSendingFriendRequest}
        onClick={handleSendFriendRequest}
        title="Add Friend"
        className={cn(
          "inline-flex items-center justify-center w-7 h-7 rounded-full",
          "bg-primary/10 text-primary border border-primary/20",
          "hover:bg-primary hover:text-white hover:border-primary",
          "hover:shadow-[0_4px_14px_hsl(var(--primary)/.4)]",
          "transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none cursor-pointer",
        )}
      >
        {isSendingFriendRequest
          ? <Loader2 size={12} className="animate-spin" />
          : <UserPlus size={12} />}
      </button>
    );
  }

  return (
    <Button
      disabled={isSendingFriendRequest}
      onClick={handleSendFriendRequest}
      size={variant === "card" ? "sm" : "default"}
      className={cn(
        "rounded-full font-semibold",
        variant === "card" ? "w-full justify-center text-[12.5px]" : "gap-1.5 px-4 py-2 text-[13px]",
        "bg-linear-to-r from-primary to-accent text-white",
        "shadow-[0_2px_14px_hsl(var(--primary)/.3)] hover:shadow-[0_4px_20px_hsl(var(--primary)/.45)]",
        "transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 hover:scale-[1.02]",
        "disabled:opacity-60 disabled:pointer-events-none cursor-pointer",
      )}
    >
      {isSendingFriendRequest ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <UserPlus size={14} className="shrink-0" />
      )}
      <span>Add Friend</span>
    </Button>
  );
}
