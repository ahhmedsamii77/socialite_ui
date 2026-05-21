import { useGetPosts } from "@/lib/apis/queries";
import PostCard from "./PostCard";
import PostCardSkeleton from "./PostCardSkeleton";
import type { PostType } from "@/types";
import { useInView } from "react-intersection-observer";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

export default function PostList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
     isLoading
  } = useGetPosts();

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "200px",
  });

  const posts: PostType[] =
    data?.pages.flatMap((page) => page.data.data.posts) || [];
  useEffect(() => {
    if (!inView) return;
    if (!hasNextPage) return;
    if (isFetchingNextPage) return;
    fetchNextPage();
  }, [inView, hasNextPage, isFetchingNextPage]);

  if (isLoading) {
    return (
      <section className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </section>
    );
  }

  return (
    <section className="space-y-4 min-h-screen">
      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}

      {isFetchingNextPage && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="animate-spin text-foreground" size={20} />
        </div>
      )}

      <div ref={ref} className="h-1" />
    </section>
  );
}
