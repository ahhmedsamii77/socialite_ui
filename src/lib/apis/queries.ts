import type {
  ConfirmEmailType,
  LoginType,
  SignupType,
  UserType,
  ChatType,
} from "@/types";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import {
  confirmEmail,
  createAccount,
  createAccountWithGmail,
  login,
  loginWithGmail,
  resendEmailOtp,
  resetPassword,
  sendResetPasswordOtp,
  verifyResetPasswordOtp,
} from "./auth.api";
import {
  acceptRequest,
  cancelRequest,
  checkFriendShipStatus,
  getUserData,
  getUsers,
  getSuggestions,
  getFriends,
  logout,
  rejectRequest,
  removeFriend,
  sendFriendRequest,
  getIncomingRequests,
  getOutgoingRequests,
  shareProfile,
  uploadCoverImages,
  uploadProfileImage,
  deleteProfileImage,
  deleteCoverImages,
  updateProfile,
  updatePassword,
  freezeAccount,
  getDashboard,
  hardDeleteUser,
  changeRole,
  restoreUser,
  freezeUserByAdmin,
} from "./user.api";
import { useAuthStore } from "../store/auth";
import { useUnreadCountsStore } from "../store/unreadCounts";
import {
  createComment,
  createPost,
  createReply,
  freezeComment,
  freezePost,
  getComments,
  getPosts,
  getReplies,
  likeComment,
  likePost,
  savePost,
  sharePost,
  updateComment,
  updatePost,
  hardDeletePost,
  restorePost,
} from "./post.api";
import {
  getNotifications,
  getUnreadCount,
  markAllRead,
  markOneRead,
  deleteNotification,
  clearAllNotifications,
} from "./notification.api";
import {
  getUserChats,
  getDirectChat,
  getGroupChat,
  createGroup,
  updateGroup,
  deleteDirectChat,
  deleteOrLeaveGroup,
  deleteMessage,
  getGroupParticipants,
  freezeChat,
  restoreChat,
  hardDeleteChat,
} from "./chat.api";

export function useCreateAccount() {
  return useMutation({
    mutationFn: (data: SignupType) => createAccount(data),
  });
}

export function useCreateAccountWithGmail() {
  return useMutation({
    mutationFn: (idToken: string) => createAccountWithGmail(idToken),
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: (flag: string = "single") => logout(flag),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { refresh_Token } = useAuthStore();
  return useMutation({
    mutationFn: (data: Parameters<typeof updateProfile>[0]) =>
      updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", refresh_Token] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      updatePassword(data),
  });
}

export function useFreezeAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => freezeAccount(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: (data: LoginType) => login(data),
  });
}

export function useloginWithGmail() {
  return useMutation({
    mutationFn: (idToken: string) => loginWithGmail(idToken),
  });
}

export function useConfirmEmail() {
  return useMutation({
    mutationFn: (data: ConfirmEmailType) => confirmEmail(data),
  });
}

export function useResendEmailOtp() {
  return useMutation({
    mutationFn: (data: { email: string }) => resendEmailOtp(data),
  });
}

export function useSendResetPasswordOtp() {
  return useMutation({
    mutationFn: (data: { email: string }) => sendResetPasswordOtp(data),
  });
}

export function useVerifyResetPasswordOtp() {
  return useMutation({
    mutationFn: (data: { email: string; otp: string }) =>
      verifyResetPasswordOtp(data),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (data: {
      email: string;
      password: string;
      confirmPassword: string;
    }) => resetPassword(data),
  });
}

export function useGetUserData(): UseQueryResult<UserType> {
  const { refresh_Token } = useAuthStore();
  return useQuery({
    queryKey: ["user", refresh_Token],
    queryFn: ({ signal }) => getUserData(signal),
    select: (data) => data.data.data.user,
    enabled: !!refresh_Token,
  });
}

export function useGetAllusers(
  search?: string,
  users?: string[],
): UseQueryResult<UserType[]> {
  return useQuery({
    queryKey: ["users", search, users],
    queryFn: ({ signal }) => getUsers(search, users, signal),
    select: (data) => data.data.data.users,
    enabled: !!search || !!users?.length,
  });
}

export function useGetSuggestions(): UseQueryResult<UserType[]> {
  const { refresh_Token } = useAuthStore();
  return useQuery({
    queryKey: ["suggestions", refresh_Token],
    queryFn: ({ signal }) => getSuggestions(signal),
    select: (data) => data.data.data.suggestions,
    enabled: !!refresh_Token,
    staleTime: 1000 * 60 * 5,
  });
}

export function useGetFriends(): UseQueryResult<UserType[]> {
  const { access_Token } = useAuthStore();
  return useQuery({
    queryKey: ["friends"],
    queryFn: ({ signal }) => getFriends(signal),
    select: (data) => data.data.data.friends as UserType[],
    enabled: !!access_Token,
    staleTime: 1000 * 60 * 2,
  });
}

export function useCheckFriendship(userId: string) {
  return useQuery({
    queryKey: ["friendship", userId],
    queryFn: ({ signal }) => checkFriendShipStatus(userId, signal),
    select: (data) => data.data.data as { status: string; requestId?: string },
    enabled: !!userId,
    staleTime: 1000 * 30,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FormData) => createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useGetPosts() {
  return useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: ({ pageParam, signal }) =>
      getPosts(pageParam ?? undefined, signal),
    getNextPageParam: (lastPage) => lastPage.data.data.nextCursor || undefined,
  });
}

export function useFreezePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => freezePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useSharePost(postId: string) {
  return useQuery({
    queryKey: ["posts", postId],
    queryFn: () => sharePost(postId),
    select: (data) => data.data.data.post,
    enabled: !!postId,
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, data }: { postId: string; data: FormData }) =>
      updatePost(postId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useLikePost() {
  return useMutation({
    mutationFn: (postId: string) => likePost(postId),
  });
}

export function useGetComments(postId: string, allowComments?: boolean) {
  return useInfiniteQuery({
    queryKey: ["comments", postId],
    queryFn: ({ pageParam, signal }) =>
      getComments(postId, pageParam ?? undefined, signal),
    getNextPageParam: (lastPage) => lastPage.data.data.nextCursor || undefined,
    enabled: !!postId && !!allowComments,
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, data }: { postId: string; data: FormData }) =>
      createComment(postId, data),
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });
}

export function useLikeComment() {
  return useMutation({
    mutationFn: ({
      postId,
      commentId,
    }: {
      postId: string;
      commentId: string;
    }) => likeComment(postId, commentId),
  });
}

export function useSavePost() {
  return useMutation({
    mutationFn: (postId: string) => savePost(postId),
  });
}

export function useGetReplies(
  postId: string,
  commentId: string,
  enabled: boolean,
) {
  return useInfiniteQuery({
    queryKey: ["replies", commentId],
    queryFn: ({ pageParam, signal }) =>
      getReplies(postId, commentId, pageParam ?? undefined, signal),
    getNextPageParam: (lastPage) => lastPage.data.data.nextCursor || undefined,
    enabled: !!postId && !!commentId && enabled,
  });
}

export function useCreateReply() {
  return useMutation({
    mutationFn: ({
      postId,
      commentId,
      data,
    }: {
      postId: string;
      commentId: string;
      data: FormData;
    }) => createReply(postId, commentId, data),
  });
}

export function useUpdateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      postId,
      commentId,
      data,
    }: {
      postId: string;
      commentId: string;
      data: FormData;
    }) => updateComment(postId, commentId, data),
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });
}

export function useFreezeComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      commentId,
      postId,
    }: {
      commentId: string;
      postId: string;
    }) => freezeComment(postId, commentId),
    onSuccess: (_, { postId, commentId }) => {
      queryClient.removeQueries({ queryKey: ["replies", commentId] });
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });
}

export function useShareProfile(userId: string): UseQueryResult<UserType> {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: ({ signal }) => shareProfile(userId, signal),
    enabled: !!userId,
    select: (data) => data.data.data.user,
  });
}

export function useUploadCoverImages() {
  const queryClient = useQueryClient();
  const { refresh_Token } = useAuthStore();
  return useMutation({
    mutationFn: (data: FormData) => uploadCoverImages(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", refresh_Token] });
    },
  });
}

export function useUploadProfileImage() {
  const queryClient = useQueryClient();
  const { refresh_Token } = useAuthStore();
  return useMutation({
    mutationFn: (data: FormData) => uploadProfileImage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", refresh_Token] });
    },
  });
}

export function useDeleteProfileImage() {
  const queryClient = useQueryClient();
  const { refresh_Token } = useAuthStore();
  return useMutation({
    mutationFn: () => deleteProfileImage(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", refresh_Token] });
    },
  });
}

export function useDeleteCoverImages() {
  const queryClient = useQueryClient();
  const { refresh_Token } = useAuthStore();
  return useMutation({
    mutationFn: () => deleteCoverImages(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", refresh_Token] });
    },
  });
}

export function useGetUsers(search?: string) {
  const { access_Token } = useAuthStore();
  return useQuery({
    queryKey: ["users", search],
    queryFn: ({ signal }) => getUsers(search, undefined, signal),
    enabled: !!access_Token,
  });
}

export function useCheckFriendShipStatus(userId: string) {
  return useQuery({
    queryKey: ["friendship", userId],
    queryFn: ({ signal }) => checkFriendShipStatus(userId, signal),
    enabled: !!userId,
    select: (data) =>
      data.data.data as {
        status: import("@/types").FriendshipStatus;
        requestId?: string;
      },
  });
}

export function useRemoveFriend() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => removeFriend(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ["friendship", userId] });
    },
  });
}

export function useSendFriendRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => sendFriendRequest(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ["outgoing-requests"] });
      queryClient.invalidateQueries({ queryKey: ["friendship", userId] });
    },
  });
}

export function useCancelRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => cancelRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outgoing-requests"] });
      queryClient.invalidateQueries({ queryKey: ["friendship"] });
    },
  });
}

export function useAcceptRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => acceptRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incoming-requests"] });
      queryClient.invalidateQueries({ queryKey: ["friendship"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useRejectRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => rejectRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incoming-requests"] });
    },
  });
}

export function useGetIncomingRequests() {
  const { access_Token } = useAuthStore();
  return useQuery({
    queryKey: ["incoming-requests"],
    queryFn: ({ signal }) => getIncomingRequests(signal),
    select: (data) =>
      data.data.data.users as (UserType & { requestId: string })[],
    enabled: !!access_Token,
  });
}

export function useGetOutgoingRequests() {
  const { access_Token } = useAuthStore();
  return useQuery({
    queryKey: ["outgoing-requests"],
    queryFn: ({ signal }) => getOutgoingRequests(signal),
    select: (data) =>
      data.data.data.users as (UserType & { requestId: string })[],
    enabled: !!access_Token,
  });
}

export function useSearchPeople(search: string) {
  const { access_Token } = useAuthStore();
  return useQuery({
    queryKey: ["people-search", search],
    queryFn: ({ signal }) => getUsers(search, undefined, signal),
    select: (data) => data.data.data.users as UserType[],
    enabled: !!access_Token && search.trim().length >= 1,
  });
}

export function useGetNotifications() {
  const { access_Token } = useAuthStore();
  return useInfiniteQuery({
    queryKey: ["notifications"],
    queryFn: ({ pageParam, signal }) =>
      getNotifications(pageParam ?? undefined, signal),
    getNextPageParam: (lastPage: any) =>
      lastPage.data.data.nextCursor || undefined,
    enabled: !!access_Token,
  });
}

export function useGetUnreadCount() {
  const { access_Token } = useAuthStore();
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: ({ signal }) => getUnreadCount(signal),
    select: (data) => data.data.data.count as number,
    enabled: !!access_Token,
    staleTime: 0,
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => markAllRead(),
    onSuccess: () => {
      // 1. Instantly zero badge
      queryClient.setQueryData(["notifications", "unread-count"], (old: any) => {
        if (!old) return old;
        return { ...old, data: { ...old.data, data: { count: 0 } } };
      });
      // 2. Refetch the list only (exact:true prevents cascade to unread-count)
      queryClient.invalidateQueries({ queryKey: ["notifications"], exact: true });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });
}

export function useMarkOneRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markOneRead(id),
    onSuccess: () => {
      // 1. Optimistically decrement badge
      queryClient.setQueryData(["notifications", "unread-count"], (old: any) => {
        if (!old) return old;
        const current = old.data?.data?.count ?? 0;
        return { ...old, data: { ...old.data, data: { count: Math.max(0, current - 1) } } };
      });
      // 2. Refetch only the list
      queryClient.invalidateQueries({ queryKey: ["notifications"], exact: true });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteNotification(id),
    onMutate: async (id: string) => {
      // Optimistically remove the notification from the list immediately
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const previous = queryClient.getQueryData(["notifications"]);
      queryClient.setQueryData(["notifications"], (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: {
              ...page.data,
              data: {
                ...page.data.data,
                notifications: page.data.data.notifications.filter(
                  (n: any) => n._id !== id
                ),
              },
            },
          })),
        };
      });
      return { previous };
    },
    onError: (_err, _id, context: any) => {
      // Roll back on error
      if (context?.previous) {
        queryClient.setQueryData(["notifications"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"], exact: true });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });
}

export function useClearAllNotifications() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => clearAllNotifications(),
    onSuccess: () => {
      // 1. Instantly zero out the badge
      queryClient.setQueryData(["notifications", "unread-count"], (old: any) => {
        if (!old) return old;
        return { ...old, data: { ...old.data, data: { count: 0 } } };
      });
      // 2. Clear the list (exact: true so it doesn't cascade to unread-count)
      queryClient.invalidateQueries({ queryKey: ["notifications"], exact: true });
      // 3. Also invalidate unread-count so it re-confirms from server
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });
}

// ── Admin hooks ───────────────────────────────────────────────────────────────

export function useGetDashboard() {
  const { access_Token } = useAuthStore();
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: ({ signal }) => getDashboard(signal),
    select: (data) =>
      data.data.data.result as [
        { status: "fulfilled"; value: any[] },
        { status: "fulfilled"; value: any[] },
        { status: "fulfilled"; value: any[] },
      ],
    enabled: !!access_Token,
  });
}

export function useHardDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => hardDeleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useChangeRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      changeRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useRestoreUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => restoreUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useHardDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => hardDeletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useRestorePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => restorePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useFreezeUserByAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => freezeUserByAdmin(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

// ── Chat hooks ─────────────────────────────────────────────────────────────────

export function useGetUserChats() {
  const { access_Token } = useAuthStore();
  return useQuery({
    queryKey: ["chats"],
    queryFn: ({ signal }) => getUserChats(signal),
    select: (data) => data.data.data.chats as ChatType[],
    enabled: !!access_Token,
    staleTime: 1000 * 30,
  });
}

export function useGetUnreadChatsCount() {
  const { data: chats = [] } = useGetUserChats();
  const { data: currentUser } = useGetUserData();
  const { counts, readChats } = useUnreadCountsStore();

  if (!currentUser) return 0;
  
  return chats.filter((chat) => {
    // If we have a specific unread count from socket > 0, it's definitely unread
    if (counts[chat._id] > 0) return true;
    
    // If the user has opened this chat in this session, it is read
    if (readChats.includes(chat._id)) return false;

    // Otherwise, fallback to the old logic: if the last message wasn't from me, assume unread
    const lastMsg = chat.messages?.[chat.messages.length - 1];
    if (!lastMsg) return false;
    const senderId =
      typeof lastMsg.createdBy === "string"
        ? lastMsg.createdBy
        : (lastMsg.createdBy as any)?._id;
    return senderId !== currentUser._id;
  }).length;
}

export function useGetDirectChat(userId: string) {
  return useInfiniteQuery({
    queryKey: ["chat", "ovo", userId],
    queryFn: ({ pageParam, signal }) =>
      getDirectChat(userId, pageParam ?? undefined, signal),
    getNextPageParam: (lastPage: any) =>
      lastPage.data.data.nextCursor || undefined,
    enabled: !!userId,
  });
}

export function useGetGroupChat(chatId: string) {
  return useInfiniteQuery({
    queryKey: ["chat", "group", chatId],
    queryFn: ({ pageParam, signal }) =>
      getGroupChat(chatId, pageParam ?? undefined, signal),
    getNextPageParam: (lastPage: any) =>
      lastPage.data.data.nextCursor || undefined,
    enabled: !!chatId,
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FormData) => createGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });
}

export function useUpdateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ chatId, data }: { chatId: string; data: FormData }) =>
      updateGroup(chatId, data),
    onSuccess: (_, { chatId }) => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      queryClient.invalidateQueries({ queryKey: ["chat", "group", chatId] });
    },
  });
}

export function useDeleteDirectChat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (chatId: string) => deleteDirectChat(chatId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });
}

export function useDeleteOrLeaveGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (chatId: string) => deleteOrLeaveGroup(chatId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      chatId,
      messageId,
    }: {
      chatId: string;
      messageId: string;
    }) => deleteMessage(chatId, messageId),
    onSuccess: (_, { chatId }) => {
      queryClient.invalidateQueries({ queryKey: ["chat", "ovo"] });
      queryClient.invalidateQueries({ queryKey: ["chat", "group", chatId] });
    },
  });
}

export function useGetGroupParticipants(chatId: string) {
  return useQuery({
    queryKey: ["group", "participants", chatId],
    queryFn: ({ signal }) => getGroupParticipants(chatId, signal),
    select: (data) =>
      data.data.data as {
        participants: UserType[];
        roomId: string;
        createdBy: string;
      },
    enabled: !!chatId,
    staleTime: 1000 * 30,
  });
}

export function useFreezeChat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (chatId: string) => freezeChat(chatId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useRestoreChat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (chatId: string) => restoreChat(chatId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useHardDeleteChat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (chatId: string) => hardDeleteChat(chatId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
