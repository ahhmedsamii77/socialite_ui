import { Card, CardContent } from "../ui/card";
import { useGetUserData, useUploadCoverImages, useUploadProfileImage, useDeleteProfileImage, useDeleteCoverImages } from "@/lib/apis/queries";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useIsOnline } from "@/hooks/useIsOnline";
import { CircleCheckBig, Users, ImagePlus, MessageSquare, Check, X, Loader2, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import toast from "react-hot-toast";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getProfileImageUrl } from "@/lib/utils";
import type { FriendshipStatus, UserType } from "@/types";
import { useFormatNumber } from "@/hooks/useFormatNumber";
import FriendshipButton from "./FriendshipButton";
import { cn } from "@/lib/utils";


export default function ProfileHeader({ profileData, friendshipStatus }: {
  profileData: UserType, friendshipStatus: {
    status: FriendshipStatus,
    requestId?: string
  }
}) {
  const { data: currentUser } = useGetUserData();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const isOnline = useIsOnline(profileData?._id);
  const [previews, setPreviews] = useState<{ url: string }[] | null>(null);
  const [files, setFiles] = useState<File[] | null>(null);

  const [profilePreview, setProfilePreview] = useState<{ url: string }[] | null>(null);
  const [profileFile, setProfileFile] = useState<File[] | null>(null);

  const isMe = currentUser?._id === profileData?._id;
  const { mutateAsync: uploadCoverImages, isPending: isUploadingCoverImages } = useUploadCoverImages();
  const { mutateAsync: uploadProfileImage, isPending: isUploadingProfileImage } = useUploadProfileImage();
  const { mutateAsync: deleteProfileImageMutation, isPending: isDeletingProfileImage } = useDeleteProfileImage();
  const { mutateAsync: deleteCoverImagesMutation, isPending: isDeletingCoverImages } = useDeleteCoverImages();
  const initials = profileData?.username?.slice(0, 2).toUpperCase() ?? "??";
  const friendsCount = useFormatNumber(profileData?.friends?.length || 0);
  const postsCount = useFormatNumber(profileData?.posts?.length || 0);
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!isMe || !acceptedFiles.length) return;
      const file = acceptedFiles[0];
      setFiles([file]);
      setPreviews([{
        url: URL.createObjectURL(file),
      }]);
    }, [isMe]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': [],
    },
    onDrop,
    multiple: false,
    maxFiles: 1,
    noKeyboard: true,
  });

  const onProfileDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!isMe || !acceptedFiles.length) return;
      const file = acceptedFiles[0];
      setProfileFile([file]);
      setProfilePreview([{
        url: URL.createObjectURL(file),
      }]);
    }, [isMe]);

  const { getRootProps: getProfileRootProps, getInputProps: getProfileInputProps } = useDropzone({
    accept: {
      'image/*': [],
    },
    onDrop: onProfileDrop,
    multiple: false,
    maxFiles: 1,
    noKeyboard: true,
  });

  const resetProfile = useCallback(() => {
    setProfileFile(null);
    if (!profileData?.profileImage) return setProfilePreview(null);
    const previewsData = [{
      url: getProfileImageUrl(profileData?.profileImage) ?? "",
    }]
    setProfilePreview(previewsData);
  }, [profileData]);
  useEffect(() => {
    resetProfile();
  }, [profileData, resetProfile]);

  const resetCover = useCallback(() => {
    setFiles(null);
    if (!profileData?.coverImages?.length) return setPreviews(null);
    const previewsData = profileData?.coverImages.map((coverImage) => {
      return {
        url: `${import.meta.env.VITE_API_BASE_URL}/upload/${coverImage}`,
      };
    }) as { url: string }[];
    setPreviews(previewsData);
  }, [profileData]);

  useEffect(() => {
    resetCover();
  }, [profileData, resetCover]);

  useEffect(() => {
    return () => {
      if (previews?.length && files?.length) {
        previews.forEach((p) => URL.revokeObjectURL(p.url));
      }
      if (profilePreview?.length && profileFile?.length) {
        profilePreview.forEach((p) => URL.revokeObjectURL(p.url));
      }
    };
  }, [previews, files, profilePreview, profileFile]);

  async function handleUploadProfileImage() {
    try {
      if (!profileFile?.length) return;
      const formData = new FormData();
      formData.append("profileImage", profileFile[0]);

      const res = await uploadProfileImage(formData);
      const newKey: string = res?.data?.data?.key;
      const newImageUrl = newKey
        ? `${import.meta.env.VITE_API_BASE_URL}/upload/${newKey}`
        : null;

      setProfileFile(null);
      setProfilePreview(newImageUrl ? [{ url: newImageUrl }] : null);

      queryClient.invalidateQueries({ queryKey: ["profile", profileData?._id] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["comments"] });
      
      toast.success("Profile image updated successfully!");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong. Please try again.");
    }
  }

  async function handleUploadCoverImages() {
    try {
      const formData = new FormData();
      if (files?.length) {
        files.forEach((c) => formData.append(`attachments`, c));
      }
      await uploadCoverImages(formData);
      toast.success("Cover updated successfully!");
      setFiles(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong. Please try again.");
    }
  }

  async function handleDeleteProfileImage() {
    try {
      await deleteProfileImageMutation();
      setProfilePreview(null);
      queryClient.invalidateQueries({ queryKey: ["profile", profileData?._id] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Profile image removed.");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong. Please try again.");
    }
  }

  async function handleDeleteCoverImages() {
    try {
      await deleteCoverImagesMutation();
      setPreviews(null);
      toast.success("Cover image removed.");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong. Please try again.");
    }
  }
  const profileImage = getProfileImageUrl(profileData?.profileImage);

  return (
    <Card className="max-w-240 mx-auto rounded-2xl overflow-hidden shadow-md p-0 animate-fade-in-up border border-border-strong hover:shadow-[0_8px_32px_rgba(139,92,246,0.08)] transition duration-300">
      <CardContent className="p-0">
        <div className="relative h-52 sm:h-60 w-full overflow-hidden group/cover">
          {!!previews?.length ? (
            <div className="relative w-full h-full">
              <img
                src={previews[0]?.url}
                alt="cover"
                className="w-full h-full object-cover"
              />
              {isMe && files?.length ? (
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <Button onClick={handleUploadCoverImages} size="sm" className="bg-primary text-white hover:bg-primary/90 rounded-full font-bold px-4 cursor-pointer">
                    {isUploadingCoverImages ? 'Uploading...' : 'Save'}
                  </Button>
                  <Button onClick={resetCover} size="sm" variant="secondary" className="rounded-full font-bold px-4 hover:bg-white text-base-muted hover:text-foreground cursor-pointer">
                    Cancel
                  </Button>
                </div>
              ) : isMe && !files?.length ? (
                <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover/cover:opacity-100 transition-opacity duration-200">
                  <div {...getRootProps()} className="cursor-pointer bg-black/60 hover:bg-black/80 text-white rounded-full py-1.5 px-3 flex items-center gap-2 backdrop-blur-md">
                    <ImagePlus size={16} />
                    <span className="text-[13px] font-medium">Edit cover</span>
                    <input type="file" className="hidden" {...getInputProps()} />
                  </div>
                  {!!profileData?.coverImages?.length && (
                    <button
                      onClick={handleDeleteCoverImages}
                      disabled={isDeletingCoverImages}
                      className="cursor-pointer bg-black/60 hover:bg-destructive/80 text-white rounded-full py-1.5 px-3 flex items-center gap-2 backdrop-blur-md transition-colors duration-200 disabled:opacity-60"
                    >
                      {isDeletingCoverImages
                        ? <Loader2 size={14} className="animate-spin" />
                        : <Trash2 size={14} />}
                      <span className="text-[13px] font-medium">Remove</span>
                    </button>
                  )}
                </div>
              ) : null}
            </div>
          ) : (
            <div {...(isMe ? getRootProps() : {})} className={`w-full h-full bg-linear-[135deg] from-primary to-accent flex items-center justify-center group ${isMe ? 'cursor-pointer' : ''}`}>
              {isMe && (
                <>
                  <div className="bg-black/30 p-4 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm duration-200">
                    <ImagePlus size={32} />
                  </div>
                  <input type="file" className="hidden" {...getInputProps()} />
                </>
              )}
            </div>
          )}
        </div>

        <div className="px-5 sm:px-8 pb-6">
          <div className="-mt-12 sm:-mt-14 mb-5">
            <div className="relative inline-block group/profile-wrapper" {...(isMe && !profileFile ? getProfileRootProps() : {})}>
              <div
                className={`p-0.75 rounded-full transition-all duration-300 relative group/avatar ${isMe && !profileFile ? 'cursor-pointer' : ''} ${isOnline
                  ? "bg-linear-to-br from-emerald-400 to-green-500 shadow-[0_0_14px_#22c55e66]"
                  : "bg-input"
                  }`}
              >
                <Avatar className="w-24 h-24 sm:w-28 sm:h-28 border-[3px] border-card">
                  <AvatarImage
                    src={profilePreview?.[0]?.url || profileImage}
                    alt={profileData?.username}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-white text-2xl font-bold bg-linear-[135deg] from-primary to-accent">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                {isMe && !profileFile && (
                  <div className="absolute inset-0.75 bg-black/40 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity rounded-full z-10 backdrop-blur-[1px]">
                    <ImagePlus size={24} className="text-white" />
                  </div>
                )}
                {isMe && !profileFile && (
                  <input type="file" className="hidden" {...getProfileInputProps()} />
                )}
              </div>

              {isOnline && !profileFile && (
                <span className="absolute bottom-1 right-1 flex h-4 w-4 z-20">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-card" />
                </span>
              )}

              {isMe && profileFile && (
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-card/90 backdrop-blur-sm p-1 rounded-full shadow-lg border border-border-strong z-20">
                  <Button onClick={(e) => { e.stopPropagation(); handleUploadProfileImage(); }} disabled={isUploadingProfileImage} size="icon" className="h-7 w-7 cursor-pointer rounded-full bg-primary text-white hover:bg-primary/90">
                    {isUploadingProfileImage ? <Loader2 size={12} className="animate-spin" /> : <Check size={14} />}
                  </Button>
                  <Button onClick={(e) => { e.stopPropagation(); resetProfile(); }} disabled={isUploadingProfileImage} size="icon" variant="secondary" className="h-7 w-7 cursor-pointer rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20">
                    <X size={14} />
                  </Button>
                </div>
              )}

              {/* Delete existing profile image — shown on hover when no new file is pending */}
              {isMe && !profileFile && profileData?.profileImage && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteProfileImage(); }}
                  disabled={isDeletingProfileImage}
                  className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-card/90 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-lg border border-border-strong z-20 text-destructive hover:bg-destructive hover:text-white transition-colors duration-200 disabled:opacity-60 opacity-0 group-hover/profile-wrapper:opacity-100 cursor-pointer"
                >
                  {isDeletingProfileImage
                    ? <Loader2 size={11} className="animate-spin" />
                    : <Trash2 size={11} />}
                  <span className="text-[11px] font-semibold">Remove</span>
                </button>
              )}
            </div>
          </div>

          <div className="space-y-1 mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground capitalize">
                {profileData?.username ?? "—"}
              </h1>
              <CircleCheckBig className="text-primary shrink-0" size={17} />
              {isMe && (
                <span className="text-[11px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                  You
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm text-muted-foreground">
                @{profileData?.username?.replace(/\s+/g, "").toLowerCase() ?? "—"}
              </p>
              <span className="text-muted-foreground/40 text-xs select-none">·</span>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border transition-all duration-300 ${isOnline
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                  : "bg-muted/40 border-input text-muted-foreground/70"
                  }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${isOnline ? "bg-emerald-500" : "bg-muted-foreground/40"
                    }`}
                />
                {isOnline ? "Online now" : "Offline"}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-5 text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Users size={15} className="text-primary/70" />
                <span className="font-bold text-foreground">{friendsCount}</span>
                <span>Friends</span>
              </div>
              <div className="w-px h-4 bg-border-strong" />
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <span className="font-bold text-foreground">{postsCount}</span>
                <span>Posts</span>
              </div>
            </div>

            {!isMe && (
              <div className="flex items-center gap-2 shrink-0">
                <FriendshipButton
                  status={friendshipStatus?.status ?? "none"}
                  requestId={friendshipStatus?.requestId ?? ""}
                  userId={profileData?._id ?? ""}
                  variant="default"
                />
                {friendshipStatus?.status === "friends" && (
                  <Button
                    onClick={() => navigate("/chat", { state: { directUser: profileData } })}
                    className={cn(
                      "group flex items-center gap-1.5 rounded-full px-4! py-2! text-[13px] font-semibold",
                      "bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/30",
                      "hover:bg-teal-500/15 hover:border-teal-500/45",
                      "transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0",
                      "disabled:opacity-60 disabled:pointer-events-none cursor-pointer",
                    )}
                  >
                    <MessageSquare size={15} className="shrink-0" />
                    <span>Message</span>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
