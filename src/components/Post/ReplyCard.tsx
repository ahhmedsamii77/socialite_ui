import { useFormatDate } from "@/hooks/useFormatDate";
import { useFormatNumber } from "@/hooks/useFormatNumber";
import { useFreezeComment, useGetUserData, useLikeComment } from "@/lib/apis/queries";
import type { CommentType } from "@/types";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { CircleCheckBig, Heart, Loader2, Pencil, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import EditCommentModal from "./EditCommentModal";
import { getProfileImageUrl } from "@/lib/utils";

export function ReplyCard({ reply }: { reply: CommentType }) {
  const { mutateAsync: likeComment }                                     = useLikeComment();
  const { data: userData }                                               = useGetUserData();
  const [isLiked, setIsLiked]                                           = useState(false);
  const [likes, setLikes]                                               = useState(0);
  const formattedDate                                                    = useFormatDate(reply?.createdAt);
  const likesCount                                                       = useFormatNumber(likes);
  const [isEditCommentOpen, setIsEditCommentOpen]                        = useState(false);
  const { mutateAsync: freezeComment, isPending: isFreezeCommentPending } = useFreezeComment();

  async function handleFreezeComment() {
    try {
      await freezeComment({ postId: reply?.postId!, commentId: reply?._id! });
      toast.success("Reply deleted.");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong.");
    }
  }

  useEffect(() => {
    setLikes(reply?.likes?.length || 0);
    setIsLiked(!!reply?.likes?.includes(userData?._id!));
  }, [reply, userData?._id]);

  async function handleLikeComment() {
    const prev = { isLiked, likes };
    try {
      setIsLiked((p) => !p);
      setLikes((p) => p + (isLiked ? -1 : 1));
      await likeComment({ postId: reply.postId!, commentId: reply._id! });
    } catch (error: any) {
      setIsLiked(prev.isLiked);
      setLikes(prev.likes);
      toast.error(error?.response?.data?.message || "Something went wrong.");
    }
  }

  return (
    <div className="flex items-start gap-2 animate-fade-in-up">
      {/* Avatar */}
      <Avatar className="w-6 h-6 shrink-0 mt-0.5">
        <AvatarImage src={getProfileImageUrl(reply?.createdBy?.profileImage)} alt={reply?.createdBy?.username} />
        <AvatarFallback className="text-white text-[9px] bg-linear-[135deg] from-primary to-accent font-bold">
          {reply?.createdBy?.fName?.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-0.5 min-w-0">
        {/* Reply bubble */}
        <div className="bg-input-base border border-border-strong rounded-xl px-3 py-2">
          <div className="flex items-center gap-1 mb-0.5">
            <span className="text-[12px] font-bold capitalize text-foreground truncate min-w-0">
              {reply?.createdBy?.username}
            </span>
            <CircleCheckBig className="text-primary shrink-0" size={9} />
            <span className="text-[10px] text-muted-foreground ml-auto shrink-0">
              {formattedDate}
            </span>
          </div>

          {reply?.content && (
            <p className="text-[12.5px] leading-relaxed whitespace-pre-wrap text-foreground/90">
              {reply.content}
            </p>
          )}

          {/* Attachments */}
          {!!reply?.attachments?.length && (
            <div className="flex gap-0.5 mt-1.5 rounded-xl overflow-hidden">
              {reply.attachments.slice(0, 2).map((att) => {
                const isImg = /\.(jpeg|jpg|gif|png|webp|bmp|tiff|tif|svg|avif|ico)$/i.test(att);
                return isImg ? (
                  <div key={att} className="overflow-hidden rounded-lg flex-1">
                    <img
                      className="w-full max-h-40 object-cover hover:scale-[1.02] transition duration-300"
                      src={`${import.meta.env.VITE_API_BASE_URL}/upload/${att}`}
                      alt={reply.content}
                    />
                  </div>
                ) : (
                  <div key={att} className="overflow-hidden rounded-lg flex-1">
                    <video className="w-full max-h-40 object-cover" controls src={`${import.meta.env.VITE_API_BASE_URL}/upload/${att}`} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-0.5 mt-0.5">
          {/* Like */}
          <Button
            size="sm"
            onClick={handleLikeComment}
            className={`bg-transparent py-0.5! px-2! cursor-pointer h-auto text-[11px] font-semibold gap-1.5 rounded-lg!
              ${isLiked
                ? "text-accent hover:bg-accent/10!"
                : "text-muted-foreground hover:bg-primary/8! hover:text-primary!"
              }`}
          >
            <Heart className={isLiked ? "pop" : ""} fill={isLiked ? "currentColor" : "none"} size={11} />
            <span>{likesCount}</span>
          </Button>

          {/* Edit — own reply only */}
          {userData?._id === reply?.createdBy?._id && (
            <Button
              onClick={() => setIsEditCommentOpen(true)}
              size="sm"
              className="bg-transparent text-muted-foreground hover:bg-amber-500/10! hover:text-amber-500! py-0.5! px-2! cursor-pointer h-auto text-[11px] font-semibold gap-1.5 rounded-lg!"
            >
              <Pencil size={11} />
              <span>Edit</span>
            </Button>
          )}

          {/* Delete — own reply only */}
          {userData?._id === reply?.createdBy?._id && (
            <Button
              onClick={handleFreezeComment}
              size="sm"
              className="bg-transparent text-muted-foreground hover:bg-destructive/10! hover:text-destructive! py-0.5! px-2! cursor-pointer h-auto text-[11px] font-semibold gap-1.5 rounded-lg!"
            >
              {isFreezeCommentPending
                ? <Loader2 className="animate-spin" size={11} />
                : <><Trash2 size={11} /><span>Delete</span></>
              }
            </Button>
          )}
        </div>
      </div>

      <EditCommentModal isOpen={isEditCommentOpen} setIsOpen={setIsEditCommentOpen} comment={reply} />
    </div>
  );
}
