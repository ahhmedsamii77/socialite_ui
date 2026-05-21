import Sidebar from "@/components/shared/Sidebar/Sidebar";
import { Outlet, useLocation } from "react-router-dom";

export default function AppLayout() {
  const { pathname } = useLocation();
  const isPostPage = pathname.startsWith("/post");
  const isChatPage = pathname.startsWith("/chat");
  return (
    <div className="flex min-h-screen overflow-x-clip">
      {!isPostPage && <Sidebar />}
      <main className={`flex-1 min-w-0 container mx-auto ${
        isChatPage
          ? "p-0"                         // chat: edge-to-edge, no padding
          : "px-4 pt-10 pb-20 md:pb-10"   // other pages: standard spacing
      }`}>
        <Outlet />
      </main>
    </div>
  )
}
