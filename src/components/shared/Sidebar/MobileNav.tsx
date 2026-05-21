import MobileNavlinks from "./MobileNavlinks";
import MobileNavSkeleton from "./MobileNavSkeleton";
import { useGetUserData } from "@/lib/apis/queries";

export default function MobileNav() {
  const { data: userData, isLoading } = useGetUserData();
  const isAdmin = userData?.role === "admin" || userData?.role === "super_admin";

  if (isLoading) return <MobileNavSkeleton />;

  return (
    <aside className="fixed animate-fade-in-up bottom-0 md:hidden z-50 right-0 left-0 h-20 bg-background border-t backdrop:blur-lg flex items-center justify-center">
      <MobileNavlinks isAdmin={isAdmin} />
    </aside>
  );
}
