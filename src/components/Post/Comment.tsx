import type { CommentType, UserType } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  CircleCheckBig, CornerUpLeft, Heart,
  Loader2, Pencil, Trash2, UserCheck,
} from "lucide-react";
import { useFormatDate } from "@/hooks/useFormatDate";
import { Link } from "react-router-dom";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { useFormatNumber } from "@/hooks/useFormatNumber";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useFreezeComment, useGetUserData, useLikeComment } from "@/lib/apis/queries";
import ReplyComment from "./ReplyComment";
import EditCommentModal from "./EditCommentModal";
import { getProfileImageUrl } from "@/lib/utils";

export default function Comment({
  comment,
  postCreatedBy,
}: {
  comment: CommentType;
  postCreatedBy?: UserType;
}) {
  const { mutateAsync: likeComment }                                       = useLikeComment();
  const [isLiked, setIsLiked]                                              = useState(false);
  const [likes, setLikes]                                                   = useState(0);
  const { data: userData }                                                  = useGetUserData();
  const [isReplyCommentsOpen, setIsReplyCommentsOpen]                       = useState(false);
  const [isEditCommentOpen, setIsEditCommentOpen]                           = useState(false);
  const { mutateAsync: freezeComment, isPending: isFreezeCommentPending }   = useFreezeComment();

  async function handleFreezeComment() {
    try {
      await freezeComment({ postId: comment?.postId!, commentId: comment?._id! });
      toast.success("Comment deleted.");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong.");
    }
  }

  async function handleLikeComment() {
    const prevLiked = isLiked;
    const prevLikes = likes;
    try {
      setIsLiked((prev) => !prev);
      setLikes((prev) => prev + (isLiked ? -1 : 1));
      await likeComment({ postId: comment?.postId!, commentId: comment?._id! });
    } catch (error: any) {
      setIsLiked(prevLiked);
      setLikes(prevLikes);
      toast.error(error?.response?.data?.message || "Something went wrong.");
    }
  }

  useEffect(() => {
    setLikes(comment?.likes?.length || 0);
    setIsLiked(!!comment?.likes?.includes(userData?._id!));
  }, [comment, userData?._id]);

  const likesCount = useFormatNumber(likes);

  return (
    <div className="flex items-start gap-2.5 w-full min-w-0">
      {/* Avatar */}
      <Avatar className="w-8 h-8 shrink-0">
        <AvatarImage
          src={getProfileImageUrl(comment?.createdBy?.profileImage)}
          alt={comment?.createdBy?.username}
        />
        <AvatarFallback className="text-white text-[11px] bg-linear-[135deg] from-primary to-accent font-bold">
          {comment?.createdBy?.fName?.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-1 min-w-0">
        {/* Comment bubble */}
        <div className="bg-input-base border border-border-strong rounded-2xl px-3.5 py-2.5 mr-2">
          {/* Author name + tags */}
          <div className="flex flex-wrap items-center gap-1 mb-1">
            <div className="text-[13px] font-bold flex items-center gap-1.5 capitalize min-w-0">
              <span className="truncate">{comment?.createdBy?.username}</span>
              <CircleCheckBig className="text-primary shrink-0" size={11} />
            </div>

            {!!comment?.tags?.length && (
              <div className="flex items-center gap-1">
                <span className="opacity-40 text-sm">·</span>
                <p className="text-[12px]">
                  <span className="font-normal text-muted-foreground">with </span>
                  <Link
                    to={`/profile/${comment?.tags?.[0]?._id}`}
                    className="font-bold text-primary hover:underline opacity-80 hover:opacity-100 transition duration-200"
                  >
                    {comment?.tags?.[0]?.username}{" "}
                  </Link>
                  {comment?.tags!.length > 1 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger className="cursor-pointer focus-visible:outline-none">
                        <span className="font-normal text-muted-foreground">and </span>
                        <span className="font-bold text-primary opacity-80 hover:opacity-100">
                          {`${comment.tags!.length - 1} others`}
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
                            {comment.tags?.slice(1).map((tag) => (
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

          {/* Content */}
          <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap text-foreground">
            {comment?.content}
          </p>

          {/* Attachments */}
          {!!comment?.attachments?.length && (
            <div className="flex gap-0.5 mt-2 rounded-xl overflow-hidden">
              {comment.attachments.slice(0, 2).map((attachment) => {
                const isImg = /\.(jpeg|jpg|gif|png|webp|bmp|tiff|tif|svg|avif|ico)$/i.test(attachment);
                return isImg ? (
                  <div key={attachment} className="overflow-hidden rounded-xl flex-1">
                    <img
                      className="w-full max-h-52 h-full object-cover hover:scale-[1.02] transition duration-300"
                      src={`${import.meta.env.VITE_API_BASE_URL}/upload/${attachment}`}
                      alt={comment?.content}
                    />
                  </div>
                ) : (
                  <div key={attachment} className="overflow-hidden rounded-xl flex-1">
                    <video
                      className="w-full max-h-52 object-cover"
                      controls
                      src={`${import.meta.env.VITE_API_BASE_URL}/upload/${attachment}`}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* Timestamp */}
          <span className="text-[11px] text-muted-foreground mt-1.5 block">
            {useFormatDate(comment?.createdAt)}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-0.5 mt-1">
          {/* Like */}
          <Button
            size="sm"
            onClick={handleLikeComment}
            className={`bg-transparent py-0.5! px-2! cursor-pointer h-auto text-[11.5px] font-semibold gap-1.5 rounded-lg!
              ${isLiked
                ? "text-accent hover:bg-accent/10!"
                : "text-muted-foreground hover:bg-primary/8! hover:text-primary!"
              }`}
          >
            <Heart className={isLiked ? "pop" : ""} fill={isLiked ? "currentColor" : "none"} size={12} />
            <span>{likesCount}</span>
          </Button>

          {/* Reply */}
          <Button
            onClick={() => setIsReplyCommentsOpen((prev) => !prev)}
            size="sm"
            className="bg-transparent text-muted-foreground hover:bg-primary/8! hover:text-primary! py-0.5! px-2! cursor-pointer h-auto text-[11.5px] font-semibold gap-1.5 rounded-lg!"
          >
            <CornerUpLeft size={12} />
            <span>Reply</span>
          </Button>

          {/* Edit — own comment only */}
          {userData?._id === comment?.createdBy?._id && (
            <Button
              onClick={() => setIsEditCommentOpen(true)}
              size="sm"
              className="bg-transparent text-muted-foreground hover:bg-amber-500/10! hover:text-amber-500! py-0.5! px-2! cursor-pointer h-auto text-[11.5px] font-semibold gap-1.5 rounded-lg!"
            >
              <Pencil size={12} />
              <span>Edit</span>
            </Button>
          )}

          {/* Delete — own comment only */}
          {userData?._id === comment?.createdBy?._id && (
            <Button
              onClick={handleFreezeComment}
              size="sm"
              className="bg-transparent text-muted-foreground hover:bg-destructive/10! hover:text-destructive! py-0.5! px-2! cursor-pointer h-auto text-[11.5px] font-semibold gap-1.5 rounded-lg!"
            >
              {isFreezeCommentPending
                ? <Loader2 className="animate-spin" size={12} />
                : <><Trash2 size={12} /><span>Delete</span></>
              }
            </Button>
          )}
        </div>

        <ReplyComment
          postCreatedBy={postCreatedBy}
          commentId={comment?._id}
          postId={comment?.postId}
          isReplyCommentsOpen={isReplyCommentsOpen}
        />
      </div>

      <EditCommentModal isOpen={isEditCommentOpen} setIsOpen={setIsEditCommentOpen} comment={comment} />
    </div>
  );
}