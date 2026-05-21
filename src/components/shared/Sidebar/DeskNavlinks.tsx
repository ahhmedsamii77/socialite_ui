import { Badge } from "@/components/ui/badge";
import { useGetUnreadCount, useGetUnreadChatsCount, useGetUserData } from "@/lib/apis/queries";
import { Bell, HomeIcon, LayoutDashboard, MessageCircle, Settings, User, Users } from "lucide-react"
import { NavLink } from "react-router-dom"
const navLinks = [
  { path: "/", icon: HomeIcon, label: "Home" },
  { path: "/profile", icon: User, label: "Profile" },
  { path: "/chat", icon: MessageCircle, label: "Chat" },
  { path: "/alerts", icon: Bell, label: "Alerts" },
  { path: "/people", icon: Users, label: "People" },
  { path: "/settings", icon: Settings, label: "Settings" },
  { path: "/admin", icon: LayoutDashboard, label: "Admin" },
];

export default function DeskNavlinks({ isAdmin = false }: { isAdmin?: boolean }) {
  const { data: userData } = useGetUserData();
  const { data: unreadCount = 0 } = useGetUnreadCount();
  const displayCount = unreadCount > 99 ? "99+" : unreadCount;
  const unreadChats = useGetUnreadChatsCount();
  const displayChats = unreadChats > 99 ? "99+" : unreadChats;

  return (
    <ul className="space-y-2">
      {navLinks.map((navLink) => {
        if (navLink.path === "/admin" && !isAdmin) return null;
        return (
          <li key={navLink.path}>
            <NavLink
              to={navLink.path === "/profile" ? `/profile/${userData?._id}` : navLink.path}
              className='navlink group'>
              <div className="relative">
                <navLink.icon size={20} className='navlink-icon' />
                {navLink.path === "/chat" && unreadChats > 0 &&
                  <Badge className="min-w-4 text-white! h-4 px-0.5 max-w-fit bg-linear-[135deg] from-primary to-accent absolute -top-2 -right-1.5 text-[9px] flex items-center justify-center">
                    {displayChats}
                  </Badge>
                }
                {navLink.path === "/alerts" && unreadCount > 0 &&
                  <Badge className="min-w-4 text-white! h-4 px-0.5 max-w-fit bg-linear-[135deg] from-primary to-accent absolute -top-2 -right-1.5 text-[9px] flex items-center justify-center">
                    {displayCount}
                  </Badge>
                }
              </div>
              <span className='text-base-muted group-hover:text-foreground transition duration-200 hidden xl:block'>{navLink.label}</span>
            </NavLink>
          </li>
        )
      })}
    </ul>
  )
}
