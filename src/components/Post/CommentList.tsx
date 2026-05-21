import { Image, Loader2, Send, UserRoundPlus, XIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useCreateComment, useGetAllusers, useGetComments, useGetUserData } from "@/lib/apis/queries";
import { ScrollArea } from "../ui/scroll-area";
import { useCallback, useEffect, useState } from "react";
import type { CommentType, UserType } from "@/types";
import Comment from "./Comment";
import CommentListSkeleton from "./CommentListSkeleton";
import { Separator } from "../ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import toast from "react-hot-toast";
import { useDropzone } from "react-dropzone";
import { Label } from "../ui/label";
import useDebounce from "@/hooks/useDebounce";
import { useInView } from "react-intersection-observer";
import { getProfileImageUrl } from "@/lib/utils";

export default function CommentList({
  isOpenComments,
  postId,
  allowComments,
  postCreatedBy
}: {
  isOpenComments: boolean;
  postId: string;
  allowComments: boolean;
  postCreatedBy?: UserType;
}) {
  const { data: userData } = useGetUserData();

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useGetComments(postId, isOpenComments && allowComments);

  const comments: CommentType[] =
    data?.pages.flatMap((page: any) => page.data.data.comments) ?? [];

  const { ref, inView } = useInView({ threshold: 0, rootMargin: "100px" });
  useEffect(() => {
    if (!inView || !hasNextPage || isFetchingNextPage) return;
    fetchNextPage();
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [previews, setPreviews] = useState<{ url: string; type: "image" | "video" }[] | null>(null);
  const [files, setFiles] = useState<File[] | null>(null);
  const [searchedTag, setSearchedTag] = useState("");
  const debouncedTag = useDebounce(searchedTag, 100);
  const [tags, setTags] = useState<UserType[]>([]);
  const { data: users } = useGetAllusers(debouncedTag !== "" ? debouncedTag.trim() : undefined);
  const { mutateAsync: createComment } = useCreateComment();
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleChange = (value: string) => {
    setActiveTab((prev) => (prev === value ? null : value));
  };

  useEffect(() => {
    return () => {
      if (previews?.length) previews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [previews]);

  function handleRemoveImage(index: number) {
    setPreviews(previews?.filter((_, i) => i !== index) as { url: string; type: "image" | "video" }[]);
    setFiles(files?.filter((_, i) => i !== index) as File[]);
  }

  function handleAddTag(user: UserType) {
    setTags((prev) => (prev.some((u) => u._id === user._id) ? prev : [...prev, user]));
    setSearchedTag("");
  }

  function handleRemoveTag(user: UserType) {
    setTags((prev) => prev.filter((u) => u._id !== user._id));
  }

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!acceptedFiles.length) return;
      setFiles((prev) => {
        const existing = prev ?? [];
        const remaining = 2 - existing.length;
        if (remaining <= 0) { toast.error("You can upload a maximum of 2 files"); return existing; }
        if (acceptedFiles.length > remaining) toast.error("You can upload a maximum of 2 files");
        return [...existing, ...acceptedFiles.slice(0, remaining)];
      });
      setPreviews((prev) => {
        const existing = prev ?? [];
        const remaining = 2 - existing.length;
        if (remaining <= 0) return existing;
        const newPreviews = acceptedFiles.slice(0, remaining).map((f) => ({
          url: URL.createObjectURL(f),
          type: f.type.startsWith("image") ? ("image" as const) : ("video" as const),
        }));
        return [...existing, ...newPreviews];
      });
    },
    [],
  );

  const { open, getInputProps } = useDropzone({
    accept: { "image/*": [], "video/*": [] },
    onDrop,
    multiple: true,
    maxFiles: 2,
    noKeyboard: true,
  });

  async function handleCreateComment() {
    setIsSending(true);
    try {
      const formData = new FormData();
      if (text) formData.append("content", text);
      if (files?.length) files.forEach((a) => formData.append("attachments", a));
      if (tags?.length > 0) tags.forEach((t, i) => formData.append(`tags[${i}]`, t._id));
      await createComment({ postId, data: formData });
      toast.success("Comment created successfully.");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message === "validation error"
          ? error?.response.data.cause.validationErrors[0].issues[0].message
          : error?.response?.data?.message || "Something went wrong.",
      );
    }
    setIsSending(false);
    setText("");
    setFiles(null);
    setTags([]);
    setPreviews(null);
  }

  return (
    <>
      {isOpenComments && (
        <div className="border-t mt-4 space-y-5">
          <div className="mt-3.5 space-y-2 animate-fade-in-up">
            {isLoading && <CommentListSkeleton />}

            {!isLoading && !!comments.length && (
              <ScrollArea className="mt-5 max-h-45 overflow-y-auto animate-fade-in-up">
                <div className="space-y-4 h-full">
                  {comments.map((comment: CommentType) => (
                    <Comment postCreatedBy={postCreatedBy} comment={comment} key={comment._id} />
                  ))}

                  {isFetchingNextPage && (
                    <div className="flex justify-center py-2">
                      <Loader2 className="animate-spin text-muted-foreground" size={15} />
                    </div>
                  )}

                  <div ref={ref} className="h-1" />
                </div>
              </ScrollArea>
            )}

            {!isLoading && comments.length === 0 && (
              <p className="text-[13px] text-base-muted text-center mt-3">
                No comments yet. Be the first!
              </p>
            )}
          </div>

          <div className="flex items-start gap-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src={getProfileImageUrl(userData?.profileImage)} alt={userData?.username} />
              <AvatarFallback className="text-white text-[11px] bg-linear-[135deg] from-primary to-accent font-bold tracking-wide">
                {userData?.fName?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 py-2.5 px-3 border-[1.5px] border-border rounded-lg focus:border-primary! bg-input-base">
              <input {...getInputProps()} />
              <div>
                {!!previews?.length && (
                  <div className="mt-3 flex gap-3 w-fit">
                    {previews.map((preview, index) => (
                      <div key={`preview-${index}`} className="relative rounded-md overflow-hidden">
                        {preview.type === "image" ? (
                          <img className="w-full max-h-30 object-cover" src={preview.url} alt="preview" />
                        ) : (
                          <video className="w-full max-h-30 object-cover" src={preview.url} controls />
                        )}
                        <Button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          variant="default"
                          size="icon"
                          className="h-5! w-5! hover:bg-destructive bg-black/90 absolute top-2 right-2 flex items-center justify-center text-white rounded-full cursor-pointer"
                        >
                          <XIcon size={12} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <Tabs value={activeTab ?? ""}>
                  {activeTab === "tag" && (
                    <div className="mt-4 flex-1 bg-overlay p-2.5 border rounded-lg">
                      <TabsContent className="space-y-2 animate-fade-in-up" value="tag">
                        <div className="space-y-1 mt-1">
                          <Label htmlFor="tag" className="flex items-center gap-1">
                            <UserRoundPlus className="text-primary" size={13} />
                            <span className="text-base-muted font-bold uppercase tracking-[0.06] text-[12px]">Tag People</span>
                          </Label>
                          <div className="flex flex-wrap gap-3 items-center">
                            {tags.map((tag) => (
                              <div
                                key={tag._id}
                                className="bg-[linear-gradient(135deg,#8B5CF626,#EC48991A)] py-0.75 pr-2 pl-1 flex items-center gap-1.5 border border-[#8B5CF647] rounded-full p-1"
                              >
                                <Avatar className="w-6 h-6">
                                  <AvatarImage src={getProfileImageUrl(tag.profileImage)} alt={tag.username} />
                                  <AvatarFallback className="text-white bg-linear-[135deg] text-[9px] from-primary to-accent font-bold tracking-wide">
                                    {tag.fName?.slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <p className="text-foreground text-[12.5px] font-semibold">{tag.fName}</p>
                                <Button
                                  type="button"
                                  onClick={() => handleRemoveTag(tag)}
                                  size="icon"
                                  className="h-4 w-4 hover:text-[#f87171] transition duration-200 hover:bg-red-400/22 bg-[#FFFFFF1A] text-base-muted flex items-center justify-center rounded-full cursor-pointer"
                                >
                                  <XIcon size={9} />
                                </Button>
                              </div>
                            ))}
                          </div>
                          <Input
                            value={searchedTag}
                            onChange={(e) => setSearchedTag(e.target.value)}
                            type="text"
                            className="bg-hover text-[12.5px]! rounded-full"
                            placeholder="Search by name or username"
                          />
                        </div>
                        {users && users.length > 0 && (
                          <ScrollArea className="mt-5 max-h-45 overflow-y-auto animate-fade-in-up">
                            <div className="space-y-3 h-full">
                              {users.slice(0, 5).map((user) => (
                                <Button
                                  type="button"
                                  onClick={() => handleAddTag(user)}
                                  key={user._id}
                                  className="flex p-2 rounded-[10px] h-auto! hover:bg-[#8B5CF617]! gap-3 bg-transparent cursor-pointer w-full justify-start"
                                >
                                  <div className="relative">
                                    <Avatar className="w-8 h-8">
                                      <AvatarImage src={getProfileImageUrl(user.profileImage)} alt={user.username} />
                                      <AvatarFallback className="text-white bg-linear-[135deg] from-primary to-accent font-bold tracking-wide">
                                        {user.fName?.slice(0, 2).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-background absolute bottom-0.5 right-0.5" />
                                  </div>
                                  <div className="flex flex-col">
                                    <p className="font-bold text-sm text-foreground capitalize">{user.username}</p>
                                    <span className="text-muted-foreground text-xs">@{user.username?.replace(" ", "").toLowerCase()}</span>
                                  </div>
                                </Button>
                              ))}
                            </div>
                          </ScrollArea>
                        )}
                        {users?.length === 0 && (
                          <p className="text-[13px] text-base-muted text-center mt-3">No results Found</p>
                        )}
                      </TabsContent>
                    </div>
                  )}
                </Tabs>
              </div>
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                type="text"
                className="text-[14px]! bg-transparent! border-none shadow-none focus-visible:ring-0"
                placeholder="Write a comment..."
              />
              <Separator className="my-1" />
              <div className="flex items-center justify-between w-full">
                <Tabs value={activeTab ?? ""}>
                  <TabsList className="bg-transparent p-0! md:gap-1 lg:gap-2">
                    <TabsTrigger
                      disabled={(previews?.length as unknown as number) >= 2}
                      className="m-0! disabled:cursor-not-allowed! data-[state=active]:bg-green-400/20 data-[state=active]:text-green-500! hover:text-inherit not-disabled:opacity-100 disabled:opacity-80 not-disabled:cursor-pointer w-8 h-8 not-disabled:hover:-translate-y-px not-disabled:hover:bg-green-400/20 not-disabled:hover:text-green-500! transition duration-200 rounded-lg text-base-muted flex items-center justify-center"
                      value="add"
                      onClick={() => open()}
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="flex items-center justify-center">
                            <Image className="size-4" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          <p>Add Photos / Videos</p>
                        </TooltipContent>
                      </Tooltip>
                    </TabsTrigger>
                    <TabsTrigger
                      className="m-0! data-[state=active]:bg-primary/20 cursor-pointer data-[state=active]:text-primary! w-8 h-8 hover:-translate-y-px hover:bg-primary/20 hover:text-primary! transition duration-200 rounded-lg text-base-muted flex items-center justify-center"
                      value="tag"
                      onClick={() => handleChange("tag")}
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="flex items-center justify-center">
                            <UserRoundPlus className="size-4" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          <p>Tag People</p>
                        </TooltipContent>
                      </Tooltip>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <Button
                  onClick={handleCreateComment}
                  disabled={(!text && !previews?.length) || isSending}
                  type="submit"
                  className="h-7 cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(139,92,246,0.55)] transition duration-200 gap-2 text-[13px] font-bold rounded-full bg-linear-[135deg] from-primary to-accent text-white"
                >
                  {isSending ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Send</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
