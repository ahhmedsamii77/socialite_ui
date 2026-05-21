import { useState } from "react";
import type { UserType } from "@/types";
import {
  useHardDeleteUser,
  useChangeRole,
  useRestoreUser,
  useFreezeUserByAdmin,
} from "@/lib/apis/queries";
import { getProfileImageUrl } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Trash2, ShieldCheck, RefreshCcw, ChevronDown,
  Search, Crown, User, ShieldAlert, Loader2, X, Snowflake,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import AdminTableSkeleton from "./AdminTableSkeleton";
import useDebounce from "@/hooks/useDebounce";

type Props = {
  users: UserType[];
  loading?: boolean;
  me?: UserType;
};

const ASSIGNABLE_ROLES = [
  { value: "user",  label: "User",  icon: User },
  { value: "admin", label: "Admin", icon: ShieldCheck },
];

const roleBadge: Record<string, string> = {
  super_admin: "bg-primary/10 text-primary border-primary/20",
  admin:       "bg-accent/10 text-accent border-accent/20",
  user:        "bg-muted/60 text-muted-foreground border-input",
};

const RoleIcon: Record<string, any> = {
  super_admin: Crown,
  admin:       ShieldAlert,
  user:        User,
};

/**
 * Backend changeRole denyedRoles:
 *   [SUPER_ADMIN, targetRole]  — always
 *   + ADMIN if requester is ADMIN  — admins can't touch other admins
 */
function canChangeTargetRole(targetUser: UserType, myRole: string): boolean {
  if (targetUser.role === "super_admin") return false;
  if (myRole === "admin" && targetUser.role === "admin") return false;
  return true;
}

/**
 * restoreAccount backend: deletedBy: { $ne: userId }
 * Fails if user self-froze (deletedBy === userId)
 */
function isSelfFrozen(user: UserType): boolean {
  return user.deletedBy?.toString() === user._id?.toString();
}

export default function UsersTable({ users, loading, me }: Props) {
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch               = useDebounce(searchInput, 400);

  const [deletingId,     setDeletingId]     = useState<string | null>(null);
  const [restoringId,    setRestoringId]    = useState<string | null>(null);
  const [freezingId,     setFreezingId]     = useState<string | null>(null);
  const [changingRoleId, setChangingRoleId] = useState<string | null>(null);

  const { mutateAsync: hardDelete      } = useHardDeleteUser();
  const { mutateAsync: changeRole      } = useChangeRole();
  const { mutateAsync: restoreUser     } = useRestoreUser();
  const { mutateAsync: freezeUserAdmin } = useFreezeUserByAdmin();

  const isFiltering = searchInput !== debouncedSearch;
  const myRole      = me?.role ?? "admin";

  const filtered = debouncedSearch.trim()
    ? users.filter((u) => {
        const q = debouncedSearch.toLowerCase();
        return (
          u.username?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.fName?.toLowerCase().includes(q) ||
          u.lName?.toLowerCase().includes(q)
        );
      })
    : users;

  if (loading) return <AdminTableSkeleton />;

  const handleFreeze = async (userId: string, username: string) => {
    if (!confirm(`Freeze "${username}"? They won't be able to log in.`)) return;
    setFreezingId(userId);
    try {
      await freezeUserAdmin(userId);
      toast.success(`"${username}" frozen.`);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to freeze user.");
    } finally {
      setFreezingId(null);
    }
  };

  const handleRestore = async (userId: string, username: string) => {
    setRestoringId(userId);
    try {
      await restoreUser(userId);
      toast.success(`"${username}" restored.`);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to restore user.");
    } finally {
      setRestoringId(null);
    }
  };

  const handleDelete = async (userId: string, username: string) => {
    if (!confirm(`Permanently delete "${username}"? This cannot be undone.`)) return;
    setDeletingId(userId);
    try {
      await hardDelete(userId);
      toast.success(`"${username}" permanently deleted.`);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to delete user.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleRole = async (userId: string, role: string) => {
    setChangingRoleId(userId);
    try {
      await changeRole({ userId, role });
      toast.success("Role updated.");
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to change role.");
    } finally {
      setChangingRoleId(null);
    }
  };

  return (
    <div className="rounded-2xl border border-border-strong bg-card-base overflow-hidden flex flex-col max-h-100">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border-strong flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0 bg-card-base z-10">
        <div>
          <h3 className="text-[14px] font-bold text-foreground">Users</h3>
          <p className="text-[12px] text-muted-foreground">
            {debouncedSearch.trim()
              ? `${filtered.length} of ${users.length} users`
              : `${users.length} total users`}
          </p>
        </div>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search users…"
            className="pl-8 pr-8 h-8 text-[13px] rounded-xl bg-input-base border border-input focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all duration-200 w-52"
          />
          {isFiltering && (
            <Loader2 size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-primary animate-spin" />
          )}
          {!isFiltering && searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-border-strong overflow-y-auto flex-1">
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground text-[13px] py-8">
            {debouncedSearch ? `No users match "${debouncedSearch}"` : "No users found."}
          </p>
        )}

        {filtered.map((user) => {
          const RIcon      = RoleIcon[user.role] ?? User;
          const isFrozen   = !!user.deletedAt;
          const selfFrozen = isFrozen && isSelfFrozen(user);
          const canChange  = canChangeTargetRole(user, myRole);
          const isDeleting  = deletingId    === user._id;
          const isRestoring = restoringId   === user._id;
          const isFreezing  = freezingId    === user._id;
          const isChanging  = changingRoleId === user._id;
          console.log(isChanging)
          return (
            <div
              key={user._id}
              className={`flex items-center gap-2.5 px-5 py-3 transition-colors ${isFrozen ? "opacity-60 bg-destructive/3" : "hover:bg-hover"}`}
            >
              {/* Avatar */}
              <Avatar className="w-8 h-8 shrink-0">
                <AvatarImage src={getProfileImageUrl(user.profileImage)} />
                <AvatarFallback className="text-white text-[11px] font-bold bg-linear-[135deg] from-primary to-accent">
                  {user.username?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-foreground truncate">
                  {user.fName ?? ""} {user.lName ?? user.username}
                  {isFrozen && (
                    <span className="ml-1.5 text-[10px] text-destructive font-medium">
                      ({selfFrozen ? "self-frozen" : "frozen"})
                    </span>
                  )}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
              </div>

              {/* Role badge + dropdown */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          disabled={!canChange || !!changingRoleId}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold transition shrink-0 ${roleBadge[user.role] ?? roleBadge["user"]} ${canChange ? "cursor-pointer hover:opacity-80" : "cursor-not-allowed opacity-60"}`}
                        >
                          {isChanging
                            ? <Loader2 size={10} className="animate-spin" />
                            : <RIcon size={10} />
                          }
                          <span className="capitalize">{user.role.replace("_", " ")}</span>
                          {canChange && <ChevronDown size={10} />}
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">
                        {ASSIGNABLE_ROLES.map(({ value, label, icon: Icon }) => {
                          const itemDisabled = user.role === value;
                          return (
                            <DropdownMenuItem
                              key={value}
                              disabled={itemDisabled}
                              onClick={() => handleRole(user._id, value)}
                              className="cursor-pointer text-[13px]"
                            >
                              <Icon size={13} className="mr-2" />
                              {label}
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </span>
                </TooltipTrigger>
                {!canChange && (
                  <TooltipContent side="top" className="text-[11px]">
                    {user.role === "super_admin"
                      ? "Cannot change super admin role"
                      : "Admins cannot change other admin roles"}
                  </TooltipContent>
                )}
              </Tooltip>

              {/* Freeze — only when NOT frozen */}
              {!isFrozen && (
                <button
                  onClick={() => handleFreeze(user._id, user.username)}
                  disabled={!!freezingId}
                  title="Freeze account"
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-amber-500 hover:bg-amber-500/10 transition cursor-pointer disabled:opacity-50"
                >
                  {isFreezing
                    ? <Loader2 size={13} className="animate-spin" />
                    : <Snowflake size={13} />
                  }
                </button>
              )}

              {/* Restore — only when frozen */}
              {isFrozen && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <button
                        onClick={() => !selfFrozen && handleRestore(user._id, user.username)}
                        disabled={selfFrozen || !!restoringId}
                        className={`w-7 h-7 flex items-center justify-center rounded-lg transition ${
                          selfFrozen
                            ? "text-muted-foreground/30 cursor-not-allowed"
                            : "text-green-500 hover:bg-green-500/10 cursor-pointer"
                        } disabled:opacity-50`}
                      >
                        {isRestoring
                          ? <Loader2 size={13} className="animate-spin" />
                          : <RefreshCcw size={13} />
                        }
                      </button>
                    </span>
                  </TooltipTrigger>
                  {selfFrozen && (
                    <TooltipContent side="top" className="text-[11px]">
                      User self-froze — cannot be restored by admin
                    </TooltipContent>
                  )}
                </Tooltip>
              )}

              {/* Hard delete — only when frozen */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <button
                      onClick={() => isFrozen && handleDelete(user._id, user.username)}
                      disabled={!isFrozen || !!deletingId}
                      className={`w-7 h-7 flex items-center justify-center rounded-lg transition ${
                        isFrozen
                          ? "text-destructive hover:bg-destructive/10 cursor-pointer"
                          : "text-muted-foreground/30 cursor-not-allowed"
                      } disabled:opacity-50`}
                    >
                      {isDeleting
                        ? <Loader2 size={13} className="animate-spin text-destructive" />
                        : <Trash2 size={13} />
                      }
                    </button>
                  </span>
                </TooltipTrigger>
                {!isFrozen && (
                  <TooltipContent side="top" className="text-[11px]">
                    Freeze account first to permanently delete
                  </TooltipContent>
                )}
              </Tooltip>
            </div>
          );
        })}
      </div>
    </div>
  );
}
