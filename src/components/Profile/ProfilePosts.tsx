import type { PostType } from "@/types";
import PostCard from "../Post/PostCard";
import ProfilePostsSkeleton from "./ProfilePostsSkeleton";
import { useInView } from "react-intersection-observer";
import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";

function RevealPost({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.05 });
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-500 ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
      }`}
    >
      {children}
    </div>
  );
}

export default function ProfilePosts({
  posts,
  isLoading,
}: {
  posts: PostType[];
  isLoading?: boolean;
}) {
  if (isLoading) return <ProfilePostsSkeleton />;

  return (
    <Card className="max-w-240 mx-auto rounded-2xl border border-border-strong shadow-md animate-fade-in-up overflow-hidden hover:shadow-[0_8px_32px_rgba(139,92,246,0.07)] transition duration-300">
      <CardHeader className="pb-3 border-b border-border-strong">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shadow-[inset_0_0_0_1px_#8B5CF622]">
            <FileText className="text-primary" size={17} />
          </div>
          <div>
            <h2 className="text-[15px] font-bold text-foreground leading-tight">Posts</h2>
            <p className="text-[12px] text-muted-foreground leading-tight">
              {posts.length} {posts.length === 1 ? "post" : "posts"}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-5 pb-6 space-y-4">
        {posts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="w-16 h-16 rounded-full bg-muted/50 border border-border-strong flex items-center justify-center">
              <FileText className="text-muted-foreground/50" size={28} />
            </div>
            <div className="text-center">
              <p className="text-[14px] font-semibold text-foreground">No posts yet</p>
              <p className="text-[12.5px] text-muted-foreground mt-1">
                Posts will appear here once published.
              </p>
            </div>
          </div>
        )}

        {posts.map((post, i) => (
          <RevealPost key={post._id} delay={Math.min(i * 80, 400)}>
            <PostCard post={post} />
          </RevealPost>
        ))}
      </CardContent>
    </Card>
  );
}
