import { useState } from "react";
import { Helmet } from "react-helmet";
import {
  Users, FileText, Heart, TrendingUp, Activity,
  ShieldCheck, RefreshCcw, MessageSquare,
} from "lucide-react";
import { useGetDashboard, useGetUserData } from "@/lib/apis/queries";
import StatsCard from "@/components/admin/StatsCard";
import UsersTable from "@/components/admin/UsersTable";
import PostsTable from "@/components/admin/PostsTable";
import ChatsTable from "@/components/admin/ChatsTable";
import AdminStatsSkeleton from "@/components/admin/AdminStatsSkeleton";
import AdminTableSkeleton from "@/components/admin/AdminTableSkeleton";
import type { UserType, PostType, ChatType } from "@/types";

type Tab = "overview" | "users" | "posts" | "chats";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "users",    label: "Users"    },
  { id: "posts",    label: "Posts"    },
  { id: "chats",    label: "Chats"    },
];

export default function Admin() {
  const [tab, setTab] = useState<Tab>("overview");
  const { data: me } = useGetUserData();
  const { data: result, isLoading, refetch, isFetching } = useGetDashboard();

  // dashboard returns a Promise.allSettled result: [users, posts, chats]
  const users: UserType[] = result?.[0]?.status === "fulfilled" ? (result[0] as any).value : [];
  const posts: PostType[] = result?.[1]?.status === "fulfilled" ? (result[1] as any).value : [];
  const chats: ChatType[] = result?.[2]?.status === "fulfilled" ? (result[2] as any).value : [];

  const totalLikes    = posts.reduce((acc, p) => acc + (p.likes?.length ?? 0), 0);
  const activeUsers   = users.filter((u) => !u.deletedAt).length;
  const frozenUsers   = users.filter((u) => !!u.deletedAt).length;
  const totalGroups   = chats.filter((c) => !!c.groupName).length;
  const deletedChats  = chats.filter((c) => !!c.deletedAt).length;

  const STATS = [
    { icon: <Users size={16} />,        label: "Total Users",    value: users.length,   color: "primary" as const },
    { icon: <FileText size={16} />,     label: "Total Posts",    value: posts.length,   color: "accent"  as const },
    { icon: <Heart size={16} />,        label: "Total Likes",    value: totalLikes,     color: "teal"    as const },
    { icon: <TrendingUp size={16} />,   label: "Active Users",   value: activeUsers,    color: "green"   as const },
    { icon: <Activity size={16} />,     label: "Frozen Users",   value: frozenUsers,    color: "amber"   as const },
    { icon: <MessageSquare size={16} />,label: "Total Chats",    value: chats.length,   color: "primary" as const },
    { icon: <Users size={16} />,        label: "Group Chats",    value: totalGroups,    color: "teal"    as const },
    { icon: <ShieldCheck size={16} />,  label: "My Role",        value: me?.role ?? "—",color: "primary" as const },
  ];

  return (
    <>
      <Helmet>
        <title>Admin Dashboard – Socialite</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fade-in-up min-h-screen">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-extrabold font-display">Admin Dashboard</h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">Platform overview and management</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-[12.5px] font-semibold border border-input text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCcw size={13} className={isFetching ? "animate-spin" : ""} />
              Refresh
            </button>
            <span className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-[12.5px] font-semibold border border-primary/30 text-primary bg-primary/8">
              <ShieldCheck size={13} />
              {me?.role === "super_admin" ? "Super Admin" : "Admin"}
            </span>
          </div>
        </div>

        {/* Stats grid */}
        {isLoading
          ? <AdminStatsSkeleton />
          : (
            <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
              {STATS.map((s) => <StatsCard key={s.label} {...s} />)}
            </div>
          )
        }

        {/* Tab nav */}
        <div className="flex items-center gap-1 border-b border-border-strong">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`px-4 py-2.5 text-[13px] font-semibold transition-all cursor-pointer border-b-2 -mb-px ${
                tab === id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
              {id === "chats" && deletedChats > 0 && (
                <span className="ml-1.5 text-[10px] bg-destructive/15 text-destructive rounded-full px-1.5 py-0.5">
                  {deletedChats} deleted
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {isLoading
          ? (
            <div className="space-y-4 pb-10">
              <AdminTableSkeleton />
              <AdminTableSkeleton />
            </div>
          )
          : (
            <div className="pb-10">
              {tab === "overview" && (
                <div className="space-y-4">
                  <UsersTable users={users} me={me} />
                  <PostsTable posts={posts} />
                  <ChatsTable chats={chats} />
                </div>
              )}
              {tab === "users" && <UsersTable users={users} me={me} />}
              {tab === "posts" && <PostsTable posts={posts} />}
              {tab === "chats" && <ChatsTable chats={chats} />}
            </div>
          )
        }
      </div>
    </>
  );
}
