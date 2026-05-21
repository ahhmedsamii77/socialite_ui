import type { PostType } from "@/types";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  useFreezePost,
  useGetComments,
  useGetUserData,
  useLikePost,
  useSavePost,
} from "@/lib/apis/queries";
import {
  Bookmark, CircleCheckBig, Ellipsis, Globe,
  Heart, Lock, MessageCircle, MessageCircleOff,
  Pencil, Share2, Trash2, UserCheck, Users,
} from "lucide-react";
import { useFormatDate } from "@/hooks/useFormatDate";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import toast from "react-hot-toast";
import EditPostModal from "./EditPostModal";
import { useEffect, useState } from "react";
import { useFormatNumber } from "@/hooks/useFormatNumber";
import CommentList from "./CommentList";
import { getProfileImageUrl } from "@/lib/utils";

export default function PostCard({ post }: { post: PostType }) {
  const { mutateAsync: freezePost } = useFreezePost();
  const { data: userData }          = useGetUserData();
  const date                        = useFormatDate(post?.createdAt);
  const [isOpen, setIsOpen]         = useState(false);
  const { mutateAsync: likePost }   = useLikePost();
  const [isLiked, setIsLiked]       = useState(false);
  const [likes, setLikes]           = useState(post?.likes?.length || 0);
  const { data: commentsData }      = useGetComments(post?._id!, post?.allowComments === "allow");
  const count                       = commentsData?.pages[0]?.data?.data?.count ?? 0;
  const [isSaved, setIsSaved]       = useState(false);
  const [isOpenComments, setIsOpenComments] = useState(false);
  const { mutateAsync: savePost }   = useSavePost();

  useEffect(() => {
    setLikes(post?.likes?.length || 0);
    setIsLiked(!!post?.likes?.includes(userData?._id!));
    setIsSaved(!!userData?.savedPosts?.includes(post?._id!));
    if (post?.allowComments === "deny") setIsOpenComments(false);
  }, [post, userData?._id]);

  async function handleLikePost() {
    const prevLiked = isLiked;
    const prevLikes = likes;
    try {
      setIsLiked((prev) => !prev);
      setLikes((prev) => prev + (isLiked ? -1 : 1));
      await likePost(post?._id!);
    } catch (error: any) {
      setIsLiked(prevLiked);
      setLikes(prevLikes);
      toast.error(error?.response?.data?.message || "Something went wrong.");
    }
  }

  async function handleFreezePost() {
    try {
      await freezePost(post?._id!);
      toast.success("Post deleted successfully.");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong.");
    }
  }

  async function handleCopyLink() {
    const link = `${window.location.origin}/post/${post._id}`;
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Link copied!");
    } catch {
      toast.error("Failed to copy link.");
    }
  }

  async function handleSavePost() {
    const prevSaved = isSaved;
    try {
      setIsSaved((prev) => !prev);
      await savePost(post?._id);
      toast.success(`Post ${isSaved ? "unsaved" : "saved"}.`);
    } catch (error: any) {
      setIsSaved(prevSaved);
      toast.error(error?.response?.data?.message || "Something went wrong.");
    }
  }

  const formatedLikes    = useFormatNumber(likes);
  const formatedComments = useFormatNumber(count);
  const profileImage     = getProfileImageUrl(post?.createdBy?.profileImage);

  return (
    <Card className="bg-card-base pb-2 border border-border-strong rounded-2xl gap-3! animate-fade-in-up hover:border-primary/30 hover:shadow-[0_8px_32px_rgba(139,92,246,0.08)] hover:-translate-y-px transition duration-200 backdrop-blur-sm overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────── */}
      <CardHeader className="flex justify-between">
        <div className="flex gap-2.5 items-center min-w-0 flex-1">
          <Link to={`/profile/${post?.createdBy?._id}`} className="shrink-0">
            <Avatar className="w-10 h-10">
              <AvatarImage src={profileImage} alt={post?.createdBy?.username} />
              <AvatarFallback className="text-white bg-linear-[135deg] from-primary to-accent font-bold tracking-wide">
                {post?.createdBy?.username?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>

          <div className="flex flex-col min-w-0 flex-1">
            {/* Name + tags row */}
            <div className="flex leading-tight flex-col md:flex-row md:gap-1">
              <div className="text-[15px] font-bold text-foreground flex items-center gap-1.25 capitalize min-w-0">
                <span className="truncate">{post?.createdBy?.username}</span>
                <CircleCheckBig className="text-primary shrink-0" size={14} />
              </div>

              {!!post?.tags?.length && (
                <div className="flex items-center gap-1">
                  <span className="opacity-40 text-sm">·</span>
                  <p className="text-[14px]">
                    <span className="font-normal text-muted-foreground">with </span>
                    <Link
                      to={`/profile/${post?.tags?.[0]?._id}`}
                      className="font-bold text-primary hover:underline opacity-80 hover:opacity-100 transition duration-200"
                    >
                      {post?.tags?.[0]?.username}{" "}
                    </Link>
                    {post?.tags!.length > 1 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger className="cursor-pointer focus-visible:outline-none">
                          <span className="font-normal text-muted-foreground">and </span>
                          <span className="font-bold text-primary opacity-80 hover:opacity-100">
                            {`${post.tags!.length - 1} others`}
                          </span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="min-w-55 overflow-hidden max-w-70 rounded-2xl border-border-strong">
                          <DropdownMenuGroup>
                            <DropdownMenuLabel className="text-muted-foreground flex items-center gap-1.5 uppercase p-2.5">
                              <UserCheck size={13} />
                              <span className="text-[11px] font-bold mt-0.5 tracking-wide">Tagged people</span>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <div className="space-y-0.5 max-h-40 overflow-auto p-1">
                              {post.tags?.slice(1).map((tag) => (
                                <DropdownMenuItem
                                  key={tag?._id}
                                  className="rounded-xl focus:bg-primary/8! hover:bg-primary/8!"
                                >
                                  <Link className="flex items-center gap-2" to={`/profile/${tag?._id}`}>
                                    <Avatar className="w-8 h-8">
                                      <AvatarImage src={getProfileImageUrl(tag?.profileImage)} alt={tag?.username} />
                                      <AvatarFallback className="text-white text-[11px] bg-linear-[135deg] from-primary to-accent font-bold">
                                        {tag?.username?.slice(0, 2).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="text-[13px] font-bold text-foreground">{tag?.username}</p>
                                      <p className="text-[11px] text-muted-foreground">@{tag?.username?.replace(" ", "").toLowerCase()}</p>
                                    </div>
                                  </Link>
                                </DropdownMenuItem>
                              ))}
                            </div>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Meta row: @username · date · visibility */}
            <div className="flex leading-tight flex-wrap items-center gap-1 text-muted-foreground min-w-0">
              <span className="text-[12.5px] truncate max-w-25 sm:max-w-37.5">
                @{post?.createdBy?.username?.replace(" ", "").toLowerCase()}
              </span>
              <span className="opacity-40 shrink-0">·</span>
              <span className="text-[12.5px] shrink-0">{date}</span>
              <span className="opacity-40 shrink-0">·</span>
              <div className="text-[11px] opacity-80 font-medium flex items-center gap-1 capitalize shrink-0">
                {post?.availability === "public"   && <Globe size={11} />}
                {post?.availability === "friends"  && <Users size={11} />}
                {post?.availability === "only_me"  && <Lock  size={11} />}
                <span>{post?.availability === "only_me" ? "Only me" : post?.availability}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ⋯ menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="text-muted-foreground h-8! w-8! bg-transparent hover:bg-primary/8! hover:text-primary! transition duration-200 cursor-pointer rounded-xl!">
              <Ellipsis size={17} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="rounded-2xl min-w-36 max-w-50 border-border-strong p-1">
            <DropdownMenuGroup>
              <div className="space-y-0.5">
                <DropdownMenuItem
                  onClick={handleCopyLink}
                  className="rounded-xl py-2 px-3 group hover:bg-primary/8! focus:bg-primary/8! hover:text-primary! focus:text-primary! text-foreground/75 text-[13px] font-medium cursor-pointer"
                >
                  <Share2 className="group-hover:text-primary group-focus:text-primary! group-hover:scale-[1.1] transition duration-200" size={14} />
                  <span>Copy link</span>
                </DropdownMenuItem>

                {post?.createdBy?._id === userData?._id && (
                  <>
                    <DropdownMenuItem
                      className="rounded-xl py-2 px-3 group hover:bg-primary/8! focus:bg-primary/8! hover:text-primary! focus:text-primary! text-foreground/75 text-[13px] font-medium cursor-pointer"
                      onClick={() => setIsOpen(true)}
                    >
                      <Pencil className="group-hover:text-primary group-focus:text-primary! group-hover:scale-[1.1] transition duration-200" size={14} />
                      <span>Edit post</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}

                {(userData?.role !== "user" || post?.createdBy?._id === userData?._id) && (
                  <DropdownMenuItem
                    onClick={handleFreezePost}
                    className="rounded-xl py-2 px-3 group hover:bg-destructive/10! focus:bg-destructive/10! hover:text-destructive! focus:text-destructive! text-foreground/75 text-[13px] font-medium cursor-pointer"
                  >
                    <Trash2 className="group-hover:text-destructive group-focus:text-destructive! group-hover:scale-[1.1] transition duration-200" size={14} />
                    <span>Delete post</span>
                  </DropdownMenuItem>
                )}
              </div>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      {/* ── Content ────────────────────────────────────────────── */}
      <CardContent className="space-y-3 p-0!">
        {post?.content && (
          <p className="text-[14.5px] text-foreground whitespace-pre-wrap leading-relaxed px-6">
            {post.content}
          </p>
        )}

        {/* Attachments */}
        {!!post?.attachments?.length && (
          <div className={`flex gap-0.5 ${post.attachments.length > 1 ? "rounded-xl overflow-hidden mx-3" : ""}`}>
            {post.attachments.slice(0, 2).map((attachment) => {
              const isImg = /\.(jpeg|jpg|gif|png|webp|bmp|tiff|tif|svg|avif|ico)$/i.test(attachment);
              return isImg ? (
                <div key={attachment} className="overflow-hidden flex-1">
                  <img
                    className="w-full max-h-125 h-100 object-cover hover:scale-[1.02] transition duration-300"
                    src={`${import.meta.env.VITE_API_BASE_URL}/upload/${attachment}`}
                    alt={post?.content}
                  />
                </div>
              ) : (
                <div key={attachment} className="overflow-hidden flex-1">
                  <video
                    className="w-full max-h-125 h-100 object-cover"
                    controls
                    src={`${import.meta.env.VITE_API_BASE_URL}/upload/${attachment}`}
                  />
                </div>
              );
            })}
          </div>
        )}

        <div className="px-6 mt-4">
          <Separator />
        </div>
      </CardContent>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <CardFooter className="flex-col items-stretch pb-0">
        <div className="flex items-center justify-between gap-1 flex-wrap">
          <div className="flex items-center gap-0.5 sm:gap-1">
            {/* Like */}
            <Button
              size="sm"
              onClick={handleLikePost}
              className={`bg-transparent py-1.5! px-2.5! sm:px-4! cursor-pointer h-auto text-[13px] sm:text-[14px] font-semibold gap-1.5 sm:gap-2 rounded-xl!
                ${isLiked
                  ? "text-accent hover:bg-accent/10!"
                  : "text-muted-foreground hover:bg-primary/8! hover:text-primary!"
                }`}
            >
              <Heart className={isLiked ? "pop" : ""} fill={isLiked ? "currentColor" : "none"} size={18} />
              <span>{formatedLikes}</span>
            </Button>

            {/* Comments */}
            {post?.allowComments === "allow" && (
              <Button
                onClick={() => setIsOpenComments((prev) => !prev)}
                size="sm"
                className="bg-transparent py-1.5! px-2.5! sm:px-4! cursor-pointer h-auto text-[13px] sm:text-[14px] font-semibold gap-1.5 sm:gap-2 rounded-xl! text-muted-foreground hover:bg-primary/8! hover:text-primary!"
              >
                <MessageCircle size={17} />
                <span>{formatedComments}</span>
              </Button>
            )}

            {/* Comments off badge */}
            {post?.allowComments === "deny" && (
              <div className="flex items-center gap-1 text-[12px] sm:text-[12.5px] font-semibold py-1 px-2.5 sm:py-1.5 sm:px-3 rounded-xl bg-destructive/8 border border-destructive/20 text-destructive">
                <MessageCircleOff size={14} />
                <span className="hidden sm:inline">Comments off</span>
                <span className="sm:hidden">Off</span>
              </div>
            )}
          </div>

          {/* Save */}
          <Button
            size="sm"
            onClick={handleSavePost}
            className={`bg-transparent py-1.5! px-2.5! sm:px-4! cursor-pointer h-auto text-[13px] sm:text-[14px] font-semibold gap-1 sm:gap-1.5 rounded-xl!
              ${isSaved
                ? "text-amber-500 hover:bg-amber-500/10!"
                : "text-muted-foreground hover:bg-primary/8! hover:text-primary!"
              }`}
          >
            <Bookmark className={isSaved ? "bookmark-pop" : ""} fill={isSaved ? "currentColor" : "none"} size={17} />
            <span className="hidden sm:inline">{isSaved ? "Saved" : "Save"}</span>
          </Button>
        </div>

        <CommentList
          isOpenComments={isOpenComments}
          postId={post?._id || ""}
          allowComments={post?.allowComments === "allow"}
          postCreatedBy={post?.createdBy}
        />
      </CardFooter>

      <EditPostModal isOpen={isOpen} setIsOpen={setIsOpen} post={post} />
    </Card>
  );
}
