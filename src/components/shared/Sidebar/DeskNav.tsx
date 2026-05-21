import { Zap } from "lucide-react"
import { Link } from "react-router-dom"
import UserAvatar from "./UserAvatar"
import DeskNavlinks from "./DeskNavlinks"
import { Separator } from "@/components/ui/separator"
import ToggleThemeBtn from "./ToggleThemeBtn"
import LogoutBtn from "./LogoutBtn"
import { useGetUserData } from "@/lib/apis/queries"
import DeskNavSkeleton from "./DeskNavSkeleton"

export default function DeskNav() {
  const { data: userData, isLoading } = useGetUserData();
  const isAdmin = userData?.role === "admin" || userData?.role === "super_admin";
  if (isLoading) return <DeskNavSkeleton />;

  return (
    <aside className="sticky animate-fade-in-up top-0 h-screen xl:w-80 xl:py-5 xl:px-6 px-2 py-5 bg-background border-r md:flex flex-col justify-between hidden w-20">
      <div className="flex flex-col gap-7 items-center xl:block xl:space-y-7">
          <Link to="/" className="flex gap-2 items-center">
            <div className="bg-linear-[135deg] text-white from-primary to-accent w-9.5 h-9.5 flex items-center justify-center shadow-lg rounded-lg">
              <Zap size={20} fill="currentColor" />
            </div>
          <span className="font-extrabold hidden xl:block text-lg bg-linear-[135deg] from-primary to-accent bg-clip-text text-transparent tracking-tight font-display shadow-[0 4px 20px var(--primary-glow), 0 0 0 1px rgba(255, 255, 255, 0.1) inset]">Socialite</span>
          </Link>
        <div className="xl:space-y-6 flex flex-col justify-center items-center gap-6 xl:block">
          <UserAvatar userData={userData as any} />
          <DeskNavlinks isAdmin={isAdmin} />
        </div>
      </div>
      <Separator className="bg-linear-90 from-transparent via-foreground/5 to-transparent my-5" />
      <div className="xl:space-y-2 flex flex-col gap-2 justify-center items-center xl:block">
        <ToggleThemeBtn />
        <LogoutBtn />
      </div>
    </aside>
  )
}
