import { Card, CardContent, CardFooter } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useGetUserData } from "@/lib/apis/queries";
import CreatePostModal from "./CreatePostModal";
import { Link } from "react-router-dom";
import { Separator } from "../ui/separator";
import { ImagePlusIcon, Smile, Tag } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { getProfileImageUrl } from "@/lib/utils";

const createPostIconsList = [
  { icon: ImagePlusIcon, label: "Photo / Video", color: "text-primary group-hover/btn:text-primary-light transition-colors" },
  { icon: Smile, label: "Feeling", color: "text-amber-500 group-hover/btn:text-amber-400 transition-colors" },
  { icon: Tag, label: "Tag", color: "text-accent group-hover/btn:text-pink-400 transition-colors" },
]

export default function CreatePost() {
  const { data: userdata } = useGetUserData();
  const initials = userdata?.username?.slice(0, 2).toUpperCase();
  const [isOpen, setIsOpen] = useState(false);
  const profileImage = getProfileImageUrl(userdata?.profileImage);
  return (
    <Card className="bg-card-base overflow-hidden animate-fade-in-up create-post pb-0 pt-4 verflow-hidden gap-0 group border hover:shadow-[0_8px_32px_rgba(139,92,246,0.1)] hover:border-primary/60 hover:-translate-y-px transition duration-200 border-border-strong rounded-2xl shadow-none backdrop-blur-sm">
      <CardContent className="overflow-hidden h-full mb-4">
        <div className="flex items-center gap-4">
          <Link to={`/profile/${userdata?._id}`}>
            <Avatar className="w-10 h-10">
              <AvatarImage
                src={profileImage}
                alt={userdata?.username}
              />
              <AvatarFallback className="text-white bg-linear-[135deg] from-primary to-accent font-bold tracking-wide">{initials}</AvatarFallback>
            </Avatar>
          </Link>
          <CreatePostModal isOpen={isOpen} setIsOpen={setIsOpen} />
        </div>
      </CardContent>
      <Separator className="h-px!" />
      <CardFooter className="h-full p-0 m-0 overflow-hidden">
        <ul className="text-[13.5px] font-semibold flex justify-around h-full! w-full gap-2 overflow-hidden">
          {createPostIconsList.map((item, index) => (
            <li className="w-full" key={index}>
              <Button onClick={() => setIsOpen(true)} className="group/btn flex w-full items-center gap-2 bg-transparent rounded-none! justify-center hover:bg-hover-base! text-white px-2 py-3 h-auto cursor-pointer">
                <item.icon size={18} className={`${item.color} `} />
                <span className="text-sm text-secondary-base">{item.label}</span>
              </Button>
            </li>
          ))}
        </ul>
      </CardFooter>
    </Card>
  )
}
