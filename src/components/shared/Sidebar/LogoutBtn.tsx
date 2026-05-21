import { Button } from "@/components/ui/button";
import useClearQueries from "@/hooks/useClearQueries";
import { useLogout } from "@/lib/apis/queries";
import { socket } from "@/lib/socket";
import { useAuthStore } from "@/lib/store/auth";
import { LogOut } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function LogoutBtn() {
  const { mutateAsync: logout } = useLogout();
  const { clearAuth } = useAuthStore();
  const navigate = useNavigate();
  async function handleLogout() {
    await logout("single");
    clearAuth();
    useAuthStore.persist.clearStorage();
    const clearQueries = useClearQueries();
    clearQueries();
    socket.disconnect();
    toast.success("Logged out successfully!");
    navigate("/auth/login", { replace: true });
  }
  return (
    <Button
      onClick={handleLogout}
      className='cursor-pointer xl:w-full w-fit bg-transparent! lg:justify-start justify-center h-11 rounded-xl font-medium text-[14px]
    relative px-4!
     before:content-[""] before:absolute before:h-1/2 before:opacity-0 xl:hover:before:opacity-100 before:transition before:duration-200 before:w-0.5 before:bg-destructive before:left-0 
      before:rounded-r-sm
      hover:bg-destructive/10! after:content-[""] after:absolute after:transition after:duration-200 after:bg-linear-[105deg] after:from-destructive/20 after:to-transparent/65 after:w-full after:h-full after:left-0 after:rouned-xl overflow-hidden after:opacity-0 hover:after:opacity-100 hover:translate-x-1 duration-200 transition group'
    >
      <LogOut size={20} className='text-base-muted! group-hover:text-destructive! transition duration-200' />
      <span className='text-base-muted group-hover:text-destructive transition duration-200 hidden xl:block'>Logout</span>
    </Button>
  )
}