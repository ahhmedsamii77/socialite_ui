import { useNavigate, useParams } from "react-router-dom";
import { useSharePost } from "@/lib/apis/queries";
import PostCard from "@/components/Post/PostCard";
import PostCardSkeleton from "@/components/Post/PostCardSkeleton";
import { ArrowLeft, FileX } from "lucide-react";
import { Helmet } from "react-helmet";

export default function PostPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { data: post, isLoading, isError } = useSharePost(postId!);
   console.log(post)
  return (
    <>
      <Helmet>
        <title>
          {post?.createdBy?.username
            ? `${post.createdBy.username}'s post — Socialite`
            : "Post — Socialite"}
        </title>
      </Helmet>

      <div className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-4 animate-fade-in-up">

        {/* ── Back header ─────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-200 text-[13.5px] font-semibold group cursor-pointer"
          >
            <ArrowLeft
              size={16}
              className="group-hover:-translate-x-0.5 transition-transform duration-200"
            />
            Back
          </button>
          <span className="text-muted-foreground/30 select-none">·</span>
          <h1 className="text-[14px] font-bold text-foreground">Post</h1>
        </div>

        {/* ── Loading ─────────────────────────────────────────── */}
        {isLoading && <PostCardSkeleton />}

        {/* ── Post ────────────────────────────────────────────── */}
        {!isLoading && post && (
          <PostCard post={post} />
        )}

        {/* ── Not found / error ───────────────────────────────── */}
        {!isLoading && (isError || !post) && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 border border-border-strong flex items-center justify-center">
              <FileX size={28} className="text-muted-foreground/40" />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-foreground">
                Post not found
              </p>
              <p className="text-[13px] text-muted-foreground mt-1">
                This post may have been deleted or you don't have access to it.
              </p>
            </div>
            <button
              onClick={() => navigate("/")}
              className="mt-2 text-[13px] font-semibold text-primary hover:underline underline-offset-2 cursor-pointer"
            >
              Go to home
            </button>
          </div>
        )}
      </div>
    </>
  );
}
