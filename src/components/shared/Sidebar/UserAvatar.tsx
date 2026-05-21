import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { UserType } from "@/types";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { getProfileImageUrl } from "@/lib/utils";


export default function UserAvatar({ userData }: { userData: UserType }) {
  const initials = userData?.username?.slice(0, 2).toUpperCase();
  const profileImage = getProfileImageUrl(userData?.profileImage);
  return (
    <Link to={`/profile/${userData?._id}`} className="flex items-center justify-between xl:border xl:bg-muted bg-transparent transition rounded-xl p-3 xl:hover:bg-primary/10 xl:hover:border-primary/10 group hover:translate-x-1 duration-200">
      <div className="flex gap-3">
        <div className="relative">
          <Avatar className="ring-primary ring-2 w-10 h-10 ring-offset-2 ring-offset-background">
            <AvatarImage
              src={profileImage}
              alt={userData?.username}
            />
            <AvatarFallback className="text-white bg-linear-[135deg] from-primary to-accent font-bold tracking-wide">{initials}</AvatarFallback>
          </Avatar>
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-background absolute bottom-0.5 right-0.5"></span>
        </div>
        <div className="flex flex-col md:hidden xl:flex">
          <p className="font-bold text-sm capitalize">{userData?.username}</p>
          <span className="text-muted-foreground text-xs">@{userData?.username?.replace(" ", "").toLowerCase()}</span>
        </div>
      </div>
      <ChevronRight className="group-hover:text-primary md:hidden xl:block" size={16} />
    </Link>
  )
}
