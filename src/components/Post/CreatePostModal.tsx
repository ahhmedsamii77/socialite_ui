import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useCreatePost, useGetAllusers, useGetUserData } from "@/lib/apis/queries";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Globe, Image, Loader2, Lock, MessageCircle, MessageCircleOff, Send, Smile, UserRoundPlus, Users, XIcon } from "lucide-react";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { useDropzone } from "react-dropzone"
import { useCallback, useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Label } from "../ui/label";
import { ScrollArea } from "../ui/scroll-area";
import type { UserType } from "@/types";
import useDebounce from "@/hooks/useDebounce";
import toast from "react-hot-toast";
import { getProfileImageUrl } from "@/lib/utils";

const emojis = ['😊', '😂', '❤️', '🔥', '✨', '🎉', '😍', '👏', '🙌', '💯', '🚀', '💡', '🎯', '⚡', '🌟', '💪', '👀', '💀', '💎', '🎨', '😎', '🥰', '😅', '🤣', '🙏', '💫', '🎵', '🌈', '🍕', '☕']
export default function CreatePostModal({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (open: boolean) => void }) {
  const { data: userData } = useGetUserData();
  const initials = userData?.username?.slice(0, 2).toUpperCase();
  const [previews, setPreviews] = useState<{ url: string, type: 'image' | 'video' }[] | null>(null);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false)
  const [allowComments, setAllowComments] = useState<"allow" | "deny">("allow");
  const [files, setFiles] = useState<File[] | null>(null)
  const [searchedTag, setSearchedTag] = useState("");
  const debouncedTag = useDebounce(searchedTag, 100);
  const [tags, setTags] = useState<UserType[]>([]);
  const { data: users } = useGetAllusers(debouncedTag !== "" ? debouncedTag.trim() : undefined);
  const [availability, setAvailability] = useState("public");
  const { mutateAsync: createPost } = useCreatePost();
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!acceptedFiles.length) return;
      setFiles(prev => {
        const existing = prev ?? [];
        const remaining = 2 - existing.length;
        if (remaining <= 0) {
          toast.error("You can upload a maximum of 2 files");
          return existing;
        }
        const toAdd = acceptedFiles.slice(0, remaining);
        if (acceptedFiles.length > remaining) {
          toast.error("You can upload a maximum of 2 files");
        }
        return [...existing, ...toAdd];
      });
      setPreviews(prev => {
        const existing = prev ?? [];
        const remaining = 2 - existing.length;
        if (remaining <= 0) return existing;
        const toAdd = acceptedFiles.slice(0, remaining);
        const newPreviews = toAdd.map(f => ({
          url: URL.createObjectURL(f),
          type: f.type.startsWith('image') ? 'image' as const : 'video' as const,
        }));
        return [...existing, ...newPreviews];
      });
    }, []);
  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    accept: {
      'image/*': [],
      'video/*': []
    },
    onDrop,
    multiple: true,
    maxFiles: 2,
    noKeyboard: true,
  });
  const [activeTab, setActiveTab] = useState<string | null>(null);


  function handleRemoveImage(index:number) {
    setPreviews(previews?.filter((_, i) => i !== index) as unknown as { url: string, type: 'image' | 'video' }[]);
    setFiles(files?.filter((_, i) => i !== index) as unknown as File[]);
  }

  const handleChange = (value: string) => {
    setActiveTab((prev) => (prev === value ? null : value));
  };

  async function handleCreatePost() {
    setIsLoading(true)
    try {
      const formData = new FormData();
      if (text) formData.append('content', text);
      if (files?.length) {
        files.forEach((a) => formData.append(`attachments`, a));
      }
      if (tags?.length > 0) {
        tags.forEach((t, i) => formData.append(`tags[${i}]`, t._id));
      }
      if (availability) formData.append('availability', availability);
      if (allowComments) formData.append('allowComments', allowComments);
      await createPost(formData);
      toast.success("Post created successfully.");
      setIsLoading(false)
    } catch (error: any) {
      console.log(error?.response.data);
      toast.error(error?.response?.data?.message === "validation error" ? error?.response.data.cause.validationErrors[0].issues[0].message : (error?.response?.data?.message || "Something went wrong."));
    }
    setIsLoading(false);
    setIsOpen(false);
    setText("");
    setFiles(null);
    setTags([]);
    setAvailability("public");
    setPreviews(null);
    setAllowComments("allow");
  }

  useEffect(() => {
    return () => {
      if (previews?.length) {
        previews.forEach((p) => URL.revokeObjectURL(p.url));
      }
    };
  }, [previews]);

  function handleAddTag(user: UserType) {
    setTags((prev) =>
      prev.some((u) => u._id === user._id) ? prev : [...prev, user]
    );
    setSearchedTag("");
  }
  function handleRemoveTag(user: UserType) {
    setTags((prev) => prev.filter((u) => u._id !== user._id));
  }
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="flex-1 w-full" asChild>
        <Button type="button" className="bg-input-base! py-2.75! justify-start px-4.5! h-auto hover:bg-hover! hover:text-secondary-base transition duration-200 border-[1.5px] border-border rounded-full cursor-pointer text-base-muted text-[14.5px]! font-normal">
          What's on your mind, {userData?.fName}
        </Button>
      </DialogTrigger>
      <DialogContent
        aria-describedby="create-post-desc"
        className="sm:max-w-140 p-0 w-full max-h-[90vh] overflow-hidden flex flex-col gap-0
      create-post-modal border
       border-border-strong rounded-4xl 
       bg-secondary shadow-[0_32px_80px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.05)_inset] 
       animate-fade-in-up
      ">
        <DialogHeader className="flex-row items-center px-6 pt-6 pb-2 before:content-[''] before:h-0.75 before:top-0 before:left-0 before:right-0 before:absolute before:bg-linear-90 before:from-primary before:via-accent before:to-[#06b6d4]">
          <DialogTitle className="sr-only">Create Post</DialogTitle>
          <p id="create-post-desc" className="sr-only">
            Create a new post with text, images, or tags
          </p>
          <div className="relative">
            <Avatar className="w-10 h-10">
              <AvatarImage
                src={getProfileImageUrl(userData?.profileImage)}
                alt={userData?.username}
              />
              <AvatarFallback className="text-white bg-linear-[135deg] from-primary to-accent font-bold tracking-wide">{initials}</AvatarFallback>
            </Avatar>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-background absolute bottom-0.5 right-0.5"></span>
          </div>
          <div className="space-y-0.5">
            <p className="text-foreground capitalize text-[15px] font-bold ">{userData?.username}</p>
            <Select value={availability} onValueChange={setAvailability}>
              <SelectTrigger
                size="sm"
                className="cursor-pointer
                 h-6.5! px-2.5 gap-1
              font-semibold border border-primary/22 
              hover:bg-primary/18! hover:border-primary/40 transition duration-200
              rounded-full text-secondary-base bg-primary/10!">
                <SelectValue defaultValue="public" />
              </SelectTrigger>
              <SelectContent className="bg-input-base! select rounded-[14px] m-0! border border-border-strong shadow-sm min-w-40 text-secondary-base">
                <SelectGroup className="cursor-pointer">
                  <SelectItem className="cursor-pointer px-3.5 py-2.75 data-[state=checked]:text-primary" value="public">
                    <Globe className="text-green-500 size-3" />
                    <span className={`text-[13px] font-semibold`}>Everyone</span>
                  </SelectItem>
                  <SelectItem className="cursor-pointer px-3.5 py-2.75 data-[state=checked]:text-primary" value="friends">
                    <Users className="text-primary size-3" />
                    <span className={`text-[13px] font-semibold`}>Friends</span>
                  </SelectItem>
                  <SelectItem className="cursor-pointer px-3.5 py-2.75 data-[state=checked]:text-primary" value="only_me">
                    <Lock className="text-muted-foreground size-3" />
                    <span className={`text-[13px] font-semibold`}>Only me</span>
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </DialogHeader>
        <Separator />
        <div className="px-6 py-2 overflow-y-auto">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="bg-transparent! 
          whitespace-pre-line  border-none
          shadow-none!
           outline-none overflow-y-auto min-h-20 
           max-h-70 p-0 focus-visible:ring-0 
           placeholder:text-base-muted text-[17px]! leading-[1.65] resize-none"
            placeholder={`What's on your mind, ${userData?.fName}?`} />

          {!!previews?.length && (
            <div className="mt-3 space-y-2">
              {previews?.map((preview, index) => (
                <div key={`preview-${index}`} className="relative rounded-xl overflow-hidden">
                  {preview.type === "image" ?
                    <img className="w-full max-h-70 object-cover" src={preview?.url} alt="preview" />
                    :
                    <video className="w-full max-h-75 object-cover" src={preview?.url} controls />
                  }
                  <Button type="button" onClick={()=> handleRemoveImage(index)} variant={"default"} size={"icon"} className="h-7 w-7 hover:bg-destructive bg-black/90 absolute top-2 right-2 flex items-center justify-center text-white rounded-full cursor-pointer">
                    <XIcon size={14} />
                  </Button>
                </div>
              ))}
            </div>
          )}
          {(!previews || previews.length < 2) && (
            <div className={`flex items-center mt-3.5 ${isDragActive ? "border-primary border-2 border-dashed rounded-[14px]" : ""}`} onClick={() => open()} {...getRootProps()}>
              <Input {...getInputProps()} className="hidden" type="file" />
              <div className="p-4.5 w-full rounded-[14px] bg-[#FFFFFF05] hover:border-primary transition duration-200 group cursor-pointer border-2 border-dashed border-border-strong  flex items-center gap-3">
                <div className="w-11 h-11 group-hover:scale-[1.05] group-hover:bg-primary/22 transition duration-200 rounded-xl text-primary bg-primary/12 flex items-center justify-center">
                  <Image size={20} />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-foreground">Add Photos / Videos</p>
                  <p className="text-[12px] text-base-muted">or drag & drop here</p>
                </div>
              </div>
            </div>
          )}
          <Tabs value={activeTab ?? ""}>
            {activeTab === "emojies" && (
              <TabsContent value="emojies" className="mt-3 space-y-1 p-3 bg-input-base transition duration-200 animate-fade-in-up shadow-sm rounded-xl border border-border-strong">
                <h3 className="text-[10.5px] font-semibold uppercase text-base-muted tracking-[0.07em]">Frequently used</h3>
                <div className="grid grid-cols-6 md:grid-cols-10">
                  {emojis.map((emoji) => (<Button className="bg-transparent cursor-pointer p-2 text-[22px] w-9.5 h-9.5 hover:bg-input hover:scale[1.3] transition duration-200" onClick={() => {
                    setText((t) => t + emoji)
                    setActiveTab(null)
                  }} key={emoji}>{emoji}</Button>))}
                </div>
              </TabsContent>
            )}
            {activeTab === "tag" && (
              <div className="border-t mt-4">
                <TabsContent className="mt-3.5 space-y-2 animate-fade-in-up" value="tag">
                  <div className="space-y-2">
                    <Label htmlFor="tag" className="flex items-center gap-1">
                      <UserRoundPlus className="text-primary" size={13} />
                      <span className="text-base-muted font-bold uppercase tracking-[0.06] text-[12px]">Tag People</span>
                    </Label>
                    <div className="flex flex-wrap gap-3 items-center ">
                      {tags?.map(tag => (
                        <div className="bg-linear-[135deg] from-primary/15 to-accent/10 py-0.75 pr-2 pl-1 flex items-center gap-1.5 border border-primary/28 rounded-full p-1" key={tag?._id}>
                          <Avatar className="w-6 h-6">
                            <AvatarImage
                              src={tag?.profileImage}
                              alt={tag?.username}
                            />
                            <AvatarFallback className="text-white bg-linear-[135deg] text-[9px] from-primary to-accent font-bold tracking-wide">{tag?.fName?.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <p className="text-foreground text-[12.5px] font-semibold">{tag?.fName}</p>
                          <Button type="button" onClick={() => handleRemoveTag(tag)} size={"icon"} className="h-4 w-4 hover:text-destructive! transition duration-200 hover:bg-destructive/15 bg-white/10 text-muted-foreground flex items-center justify-center rounded-full cursor-pointer">
                            <XIcon size={9} />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Input value={searchedTag} onChange={(e) => setSearchedTag(e.target.value)} type="text" className="bg-input-base text-sm" placeholder="Search by name or username" />
                  </div>
                  {(users && users?.length > 0) && (
                    <ScrollArea className="mt-5 max-h-45 overflow-y-auto animate-fade-in-up">
                      <div className="space-y-3 h-full">
                        {users?.slice(0, 5).map((user) => (
                          <Button type="button" onClick={() => handleAddTag(user)} key={user?._id} className="flex p-2 rounded-xl h-auto! hover:bg-primary/8! gap-3 bg-transparent cursor-pointer w-full justify-start">
                            <div className="relative">
                              <Avatar className="w-8 h-8">
                                <AvatarImage
                                  src={user?.profileImage}
                                  alt={user?.username}
                                />
                                <AvatarFallback className="text-white text- bg-linear-[135deg] from-primary to-accent font-bold tracking-wide">{user?.fName?.slice(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <span className="w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-background absolute bottom-0.5 right-0.5"></span>
                            </div>
                            <div className="flex flex-col">
                              <p className="font-bold text-sm text-foreground capitalize">{user?.username}</p>
                              <span className="text-muted-foreground text-xs">@{user?.username?.replace(" ", "").toLowerCase()}</span>
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
        <div className="px-6 border-t pb-4 pt-3 space-y-2">
          <h3 className="text-[11.5px] uppercase font-semibold tracking-[0.07em] text-base-muted">Add to your post</h3>
          <div className="flex items-center justify-between">
            <Tabs value={activeTab ?? ""}>
              <TabsList className="bg-transparent p-0! md:gap-1 lg:gap-2">
                <TabsTrigger
                  className="m-0! data-[state=active]:bg-green-400/20 data-[state=active]:text-green-500! cursor-pointer w-10 h-10 hover:-translate-y-px hover:bg-green-400/20 hover:text-green-500! transition duration-200 rounded-lg text-base-muted flex items-center justify-center"
                  value="add"
                  onClick={() => open()}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-pointer flex items-center justify-center">
                        <Image className="size-5" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Add Photos / Videos</p>
                    </TooltipContent>
                  </Tooltip>
                </TabsTrigger>

                <TabsTrigger
                  className="m-0! cursor-pointer data-[state=active]:bg-yellow-400/20 w-10 h-10 hover:-translate-y-px hover:bg-yellow-400/20 hover:text-yellow-500! transition duration-200 rounded-lg text-base-muted flex items-center justify-center data-[state=active]:text-yellow-500!"
                  value="emojies"
                  onClick={() => handleChange("emojies")}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-pointer flex items-center justify-center">
                        <Smile className="size-5" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Emoji</p>
                    </TooltipContent>
                  </Tooltip>
                </TabsTrigger>

                <TabsTrigger
                  className="m-0! data-[state=active]:bg-primary/20 cursor-pointer data-[state=active]:text-primary! w-10 h-10 hover:-translate-y-px hover:bg-primary/20 hover:text-primary! transition duration-200 rounded-lg text-base-muted flex items-center justify-center"
                  value="tag"
                  onClick={() => handleChange("tag")}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-pointer flex items-center justify-center">
                        <UserRoundPlus className="size-5" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Tag People</p>
                    </TooltipContent>
                  </Tooltip>
                </TabsTrigger>
                <TabsTrigger
                  className={`m-0! ${allowComments === "allow" ? 'hover:bg-teal-500/12 hover:text-teal-500' : 'data-[state=active]:text-destructive! data-[state=active]:bg-destructive/12 hover:bg-destructive/12 hover:text-destructive'} cursor-pointer w-10 h-10 hover:-translate-y-px transition duration-200 rounded-lg text-base-muted flex items-center justify-center`}
                  value="allowComment"
                  onClick={() => {
                    handleChange("allowComment")
                    setAllowComments(allowComments == "allow" ? "deny" : "allow")
                  }}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-pointer flex items-center justify-center">
                        {allowComments == "allow" && <>
                          <MessageCircle className="size-5" />
                        </>}
                        {allowComments == "deny" && <>
                          <MessageCircleOff className="size-5" />
                        </>}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>{allowComments == "allow" ? "Comments on" : "Comments off"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Button onClick={handleCreatePost} disabled={(!text && !previews?.length) || isLoading} type="submit" className="py-2! px-5.5! h-auto cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(139,92,246,0.55)] transition duration-200 gap-2 text-[14px] font-bold rounded-full bg-linear-[135deg] from-primary to-accent text-white">
              {isLoading && (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Posting...</span>
                </>
              )}
              {!isLoading && <>
                <Send size={15} />
                <span className="">Post</span>
              </>}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog >
  )
}
