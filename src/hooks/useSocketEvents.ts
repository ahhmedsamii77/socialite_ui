import { socket } from "@/lib/socket";
import type { CommentType, MessageType, NotificationType, PostType } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useOnlineUsersStore } from "@/lib/store/onlineUsers";
import { useUnreadCountsStore } from "@/lib/store/unreadCounts";

export default function useSocketEvents() {
  const queryClient = useQueryClient();
  const { setOnline, setOffline, setInitial } = useOnlineUsersStore();
  const { increment: incrementUnread } = useUnreadCountsStore();

  useEffect(() => {
    // ── Handler definitions ────────────────────────────────────────────────────

    const handleNewNotification = (notification: NotificationType) => {
      queryClient.setQueryData(["notifications"], (old: any) => {
        if (!old?.pages) {
          return {
            pages: [{ data: { data: { notifications: [notification], nextCursor: null } } }],
            pageParams: [undefined],
          };
        }
        const alreadyExists = old.pages[0]?.data?.data?.notifications?.some(
          (n: NotificationType) => n._id === notification._id,
        );
        if (alreadyExists) return old;
        return {
          ...old,
          pages: old.pages.map((page: any, i: number) =>
            i === 0
              ? {
                  ...page,
                  data: {
                    ...page.data,
                    data: {
                      ...page.data.data,
                      notifications: [notification, ...page.data.data.notifications],
                    },
                  },
                }
              : page,
          ),
        };
      });

      queryClient.setQueryData(["notifications", "unread-count"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: { ...old.data, data: { count: (old.data?.data?.count ?? 0) + 1 } },
        };
      });
    };

    const handleFriendshipUpdated = ({ userId, status, requestId }: { userId: string; status: string; requestId?: string }) => {
      queryClient.setQueryData(["friendship", userId], (old: any) => ({
        ...old,
        data: {
          ...old?.data,
          data: { ...old?.data?.data, status, ...(requestId ? { requestId } : {}) },
        },
      }));
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      queryClient.invalidateQueries({ queryKey: ["incoming-requests"] });
      queryClient.invalidateQueries({ queryKey: ["outgoing-requests"] });
    };

    const handleCreatePost = (newPost: PostType) => {
      queryClient.setQueryData(["posts"], (old: any) => {
        if (!old?.pages) return old;
        const exists = old.pages[0].data.data.posts.some((p: PostType) => p._id === newPost._id);
        if (exists) return old;
        return {
          ...old,
          pages: old.pages.map((page: any, i: number) =>
            i === 0
              ? { ...page, data: { ...page.data, data: { ...page.data.data, posts: [newPost, ...page.data.data.posts] } } }
              : page,
          ),
        };
      });
    };

    const handleUpdatePost = (updatedPost: PostType) => {
      queryClient.setQueryData(["posts"], (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: {
              ...page.data,
              data: {
                ...page.data.data,
                posts: page.data.data.posts.map((post: PostType) =>
                  post._id === updatedPost._id ? { ...post, ...updatedPost } : post,
                ),
              },
            },
          })),
        };
      });
    };

    const handleRemovePost = ({ postId }: { postId: string }) => {
      queryClient.setQueryData(["posts"], (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: {
              ...page.data,
              data: { ...page.data.data, posts: page.data.data.posts.filter((p: PostType) => p._id !== postId) },
            },
          })),
        };
      });
    };

    const handleLikePost = ({ postId, userId, action }: any) => {
      queryClient.setQueryData(["posts"], (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: {
              ...page.data,
              data: {
                ...page.data.data,
                posts: page.data.data.posts.map((post: PostType) =>
                  post._id === postId
                    ? {
                        ...post,
                        likes: action === "like"
                          ? [userId, ...(post.likes || [])]
                          : post.likes?.filter((id: string) => id !== userId) || [],
                      }
                    : post,
                ),
              },
            },
          })),
        };
      });
    };

    const handleCreateComment = (newComment: CommentType) => {
      queryClient.setQueryData(["comments", newComment.postId], (old: any) => {
        if (!old) {
          return {
            pages: [{ data: { data: { comments: [newComment], count: 1, nextCursor: "" } } }],
            pageParams: [],
          };
        }
        return {
          ...old,
          pages: old.pages.map((page: any, i: number) =>
            i === 0
              ? {
                  ...page,
                  data: {
                    ...page.data,
                    data: {
                      ...page.data.data,
                      count: page.data.data.count + 1,
                      comments: [newComment, ...page.data.data.comments],
                    },
                  },
                }
              : page,
          ),
        };
      });
    };

    const handleCreateReply = (newReply: CommentType) => {
      queryClient.setQueryData(["replies", newReply.commentId], (old: any) => {
        if (!old) {
          return {
            pages: [{ data: { data: { replies: [newReply], count: 1, nextCursor: "" } } }],
            pageParams: [],
          };
        }
        return {
          ...old,
          pages: old.pages.map((page: any, i: number) =>
            i === old.pages.length - 1
              ? {
                  ...page,
                  data: {
                    ...page.data,
                    data: { ...page.data.data, count: page.data.data.count + 1, replies: [newReply, ...page.data.data.replies] },
                  },
                }
              : page,
          ),
        };
      });

      queryClient.setQueryData(["comments", newReply.postId], (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any, i: number) =>
            i === 0
              ? { ...page, data: { ...page.data, data: { ...page.data.data, count: page.data.data.count + 1 } } }
              : page,
          ),
        };
      });
    };

    const handleLikeComment = ({ postId, commentId, userId, action, parentCommentId }: any) => {
      queryClient.setQueryData(["comments", postId], (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: {
              ...page.data,
              data: {
                ...page.data.data,
                comments: page.data.data.comments.map((c: CommentType) =>
                  c._id === commentId
                    ? {
                        ...c,
                        likes: action === "like"
                          ? [userId, ...(c.likes || [])]
                          : c.likes?.filter((id: string) => id !== userId) || [],
                      }
                    : c,
                ),
              },
            },
          })),
        };
      });

      if (parentCommentId) {
        queryClient.setQueryData(["replies", parentCommentId], (old: any) => {
          if (!old?.pages) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              data: {
                ...page.data,
                data: {
                  ...page.data.data,
                  replies: page.data.data.replies.map((r: CommentType) =>
                    r._id === commentId
                      ? {
                          ...r,
                          likes: action === "like"
                            ? [userId, ...(r.likes || [])]
                            : r.likes?.filter((id: string) => id !== userId) || [],
                        }
                      : r,
                  ),
                },
              },
            })),
          };
        });
      }
    };

    const handleUpdateComment = ({ updatedComment, parentCommentId }: { updatedComment: CommentType; parentCommentId?: string }) => {
      if (parentCommentId) {
        queryClient.setQueryData(["replies", parentCommentId], (old: any) => {
          if (!old?.pages) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              data: {
                ...page.data,
                data: {
                  ...page.data.data,
                  replies: page.data.data.replies.map((reply: CommentType) =>
                    reply._id === updatedComment._id ? { ...reply, ...updatedComment } : reply,
                  ),
                },
              },
            })),
          };
        });
      } else {
        queryClient.setQueryData(["comments", updatedComment.postId], (old: any) => {
          if (!old?.pages) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              data: {
                ...page.data,
                data: {
                  ...page.data.data,
                  comments: page.data.data.comments.map((comment: CommentType) =>
                    comment._id === updatedComment._id ? { ...comment, ...updatedComment } : comment,
                  ),
                },
              },
            })),
          };
        });
      }
    };

    const handleRemoveComment = ({ commentId, postId, parentCommentId, repliesCount }: { commentId: string; postId: string; parentCommentId?: string; repliesCount?: number }) => {
      if (parentCommentId) {
        queryClient.setQueryData(["comments", postId], (old: any) => {
          if (!old?.pages) return old;
          return {
            ...old,
            pages: old.pages.map((page: any, i: number) => ({
              ...page,
              data: {
                ...page.data,
                data: { ...page.data.data, count: i === 0 ? Math.max(page.data.data.count - 1, 0) : page.data.data.count },
              },
            })),
          };
        });

        queryClient.setQueryData(["replies", parentCommentId], (old: any) => {
          if (!old?.pages) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              data: {
                ...page.data,
                data: {
                  ...page.data.data,
                  count: Math.max(page.data.data.count - 1, 0),
                  replies: page.data.data.replies.filter((r: CommentType) => r._id !== commentId),
                },
              },
            })),
          };
        });
      } else {
        queryClient.setQueryData(["comments", postId], (old: any) => {
          if (!old?.pages) return old;
          return {
            ...old,
            pages: old.pages.map((page: any, i: number) => ({
              ...page,
              data: {
                ...page.data,
                data: {
                  ...page.data.data,
                  count: i === 0 ? Math.max(page.data.data.count - 1 - (repliesCount || 0), 0) : page.data.data.count,
                  comments: page.data.data.comments.filter((c: CommentType) => c._id !== commentId),
                },
              },
            })),
          };
        });

        queryClient.removeQueries({ queryKey: ["replies", commentId] });
      }
    };

    // ── Chat handlers ──────────────────────────────────────────────────────────

    const appendMessage = (queryKey: unknown[], message: MessageType) => {
      queryClient.setQueryData(queryKey, (old: any) => {
        // If cache is empty/unloaded, create a synthetic first page so the message appears immediately
        if (!old?.pages?.length) {
          return {
            pages: [{
              data: {
                data: {
                  chat: { messages: [message] },
                  nextCursor: null,
                },
              },
            }],
            pageParams: [undefined],
          };
        }
        return {
          ...old,
          pages: old.pages.map((page: any, i: number) =>
            i === old.pages.length - 1
              ? {
                  ...page,
                  data: {
                    ...page.data,
                    data: {
                      ...page.data.data,
                      chat: {
                        ...page.data.data.chat,
                        messages: [...(page.data.data.chat?.messages || []), message],
                      },
                    },
                  },
                }
              : page,
          ),
        };
      });
    };

    const handleReceiveMessage = ({ chatId, otherUserId, message }: { chatId: string; otherUserId: string; message: MessageType }) => {
      // 0. Track unread count (badge resets when user opens the chat)
      if (chatId) incrementUnread(chatId.toString());
      // 1. Instantly update sidebar: update last message AND move chat to top
      queryClient.setQueryData(["chats"], (old: any) => {
        const chats: any[] = old?.data?.data?.chats ?? [];
        const idx = chats.findIndex(
          (c: any) =>
            !c.groupName &&
            c.participants?.some((p: any) => (p._id ?? p) === otherUserId),
        );
        if (idx === -1) return old; // new chat — invalidateQueries below handles it
        const updated = { ...chats[idx], messages: [...(chats[idx].messages || []), message] };
        const reordered = [updated, ...chats.filter((_, i) => i !== idx)];
        return {
          ...old,
          data: {
            ...old?.data,
            data: { ...old?.data?.data, chats: reordered },
          },
        };
      });
      // 2. Instantly update the open chat window
      appendMessage(["chat", "ovo", otherUserId], message);
      // 3. Follow-up refetch for sidebar + specific OVO window (fallback if append failed)
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      queryClient.invalidateQueries({ queryKey: ["chat", "ovo", otherUserId] });
    };

    const handleReceiveGroupMessage = ({ chatId, message }: { chatId: string; message: MessageType }) => {
      // 0. Track unread count (badge resets when user opens the chat)
      if (chatId) incrementUnread(chatId.toString());
      // 1. Instantly update sidebar: update last message AND move group to top
      queryClient.setQueryData(["chats"], (old: any) => {
        const chats: any[] = old?.data?.data?.chats ?? [];
        const idx = chats.findIndex((c: any) => c._id === chatId);
        if (idx === -1) return old;
        const updated = { ...chats[idx], messages: [...(chats[idx].messages || []), message] };
        const reordered = [updated, ...chats.filter((_, i) => i !== idx)];
        return {
          ...old,
          data: {
            ...old?.data,
            data: { ...old?.data?.data, chats: reordered },
          },
        };
      });
      // 2. Instantly update the open group chat window
      appendMessage(["chat", "group", chatId], message);
      // 3. Follow-up refetch for sidebar + specific group window (fallback if append failed)
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      queryClient.invalidateQueries({ queryKey: ["chat", "group", chatId] });
    };

    const handleMessageDeleted = ({ chatId, messageId }: { chatId: string; messageId: string }) => {
      const markDeleted = (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: {
              ...page.data,
              data: {
                ...page.data.data,
                chat: {
                  ...page.data.data.chat,
                  messages: (page.data.data.chat?.messages || []).map((m: MessageType) =>
                    m._id === messageId
                      ? { ...m, content: "", attachments: [], deletedAt: new Date().toISOString() }
                      : m,
                  ),
                },
              },
            },
          })),
        };
      };
      queryClient.setQueriesData({ queryKey: ["chat", "ovo"] }, markDeleted);
      queryClient.setQueriesData({ queryKey: ["chat", "group", chatId] }, markDeleted);
    };

    const handleChatDeleted = ({ chatId, otherUserId }: { chatId: string; otherUserId?: string }) => {
      // 1. Immediately remove from sidebar chats list (instant)
      queryClient.setQueryData(["chats"], (old: any) => {
        const chats: any[] = old?.data?.data?.chats ?? [];
        return {
          ...old,
          data: {
            ...old?.data,
            data: {
              ...old?.data?.data,
              chats: chats.filter((c: any) => c._id !== chatId),
            },
          },
        };
      });
      // 2. Remove the specific cache entries
      if (otherUserId) {
        queryClient.removeQueries({ queryKey: ["chat", "ovo", otherUserId] });
      } else {
        queryClient.removeQueries({ queryKey: ["chat", "ovo"] });
      }
      queryClient.removeQueries({ queryKey: ["chat", "group", chatId] });
      queryClient.removeQueries({ queryKey: ["group", "participants", chatId] });
      // 3. Follow-up refetch for eventual consistency
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    };

    const handleParticipantLeft = ({ chatId, userId }: { chatId: string; userId: string }) => {
      // 1. Instantly update the open group chat window participants list
      queryClient.setQueryData(["chat", "group", chatId], (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: {
              ...page.data,
              data: {
                ...page.data.data,
                chat: {
                  ...page.data.data.chat,
                  participants: (page.data.data.chat?.participants || []).filter(
                    (p: any) => (p._id ?? p) !== userId,
                  ),
                },
              },
            },
          })),
        };
      });
      // 2. Instantly update the sidebar member count
      queryClient.setQueryData(["chats"], (old: any) => {
        const chats: any[] = old?.data?.data?.chats ?? [];
        return {
          ...old,
          data: {
            ...old?.data,
            data: {
              ...old?.data?.data,
              chats: chats.map((c: any) =>
                c._id === chatId
                  ? {
                      ...c,
                      participants: (c.participants || []).filter(
                        (p: any) => (p._id ?? p) !== userId,
                      ),
                    }
                  : c,
              ),
            },
          },
        };
      });
      // 3. Also invalidate participants cache
      queryClient.invalidateQueries({ queryKey: ["group", "participants", chatId] });
    };

    const handleJoinRoom = ({ roomId, chat: newGroup }: { roomId: string; chat?: any }) => {
      // Join the socket room for future real-time group messages
      socket.emit("joinGroupRoom", { roomId });
      // Immediately add the new group to the chats sidebar (no network round-trip)
      if (newGroup) {
        queryClient.setQueryData(["chats"], (old: any) => {
          const chats: any[] = old?.data?.data?.chats ?? [];
          const exists = chats.some((c: any) => c._id === newGroup._id);
          if (exists) return old;
          return {
            ...old,
            data: {
              ...old?.data,
              data: { ...old?.data?.data, chats: [newGroup, ...chats] },
            },
          };
        });
      }
      // Follow-up refetch for eventual consistency
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    };

    const handleGroupUpdated = ({ chatId, groupName, groupImage }: { chatId: string; groupName: string; groupImage: string | null }) => {
      // 1. Immediately update the sidebar chats list (instant)
      queryClient.setQueryData(["chats"], (old: any) => {
        const chats: any[] = old?.data?.data?.chats ?? [];
        return {
          ...old,
          data: {
            ...old?.data,
            data: {
              ...old?.data?.data,
              chats: chats.map((c: any) =>
                c._id === chatId ? { ...c, groupName, groupImage } : c,
              ),
            },
          },
        };
      });
      // 2. Immediately update the open group chat window (instant)
      queryClient.setQueryData(["chat", "group", chatId], (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: {
              ...page.data,
              data: {
                ...page.data.data,
                chat: { ...page.data.data.chat, groupName, groupImage },
              },
            },
          })),
        };
      });
      // 3. Follow-up refetch for eventual consistency
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    };

    // ── Register / cleanup ─────────────────────────────────────────────────────

    const registerEvents = () => {
      console.log("✅ register events");

      socket.off("new_post");        socket.on("new_post", handleCreatePost);
      socket.off("updated_post");    socket.on("updated_post", handleUpdatePost);
      socket.off("remove_post");     socket.on("remove_post", handleRemovePost);
      socket.off("like_post");       socket.on("like_post", handleLikePost);
      socket.off("new_comment");     socket.on("new_comment", handleCreateComment);
      socket.off("new_reply");       socket.on("new_reply", handleCreateReply);
      socket.off("like_comment");    socket.on("like_comment", handleLikeComment);
      socket.off("update_comment");  socket.on("update_comment", handleUpdateComment);
      socket.off("remove_comment");  socket.on("remove_comment", handleRemoveComment);
      socket.off("user_online");     socket.on("user_online", ({ userId }: { userId: string }) => setOnline(userId));
      socket.off("user_offline");    socket.on("user_offline", ({ userId }: { userId: string }) => setOffline(userId));
      socket.off("friendship_updated"); socket.on("friendship_updated", handleFriendshipUpdated);
      socket.off("new_notification");   socket.on("new_notification", handleNewNotification);
      // chat
      socket.off("receiveMessage");        socket.on("receiveMessage", handleReceiveMessage);
      socket.off("receiveGroupMessage");   socket.on("receiveGroupMessage", handleReceiveGroupMessage);
      socket.off("messageDeleted");        socket.on("messageDeleted", handleMessageDeleted);
      socket.off("chatDeleted");           socket.on("chatDeleted", handleChatDeleted);
      socket.off("participantLeft");       socket.on("participantLeft", handleParticipantLeft);
      socket.off("joinRoom");              socket.on("joinRoom", handleJoinRoom);
      socket.off("groupUpdated");          socket.on("groupUpdated", handleGroupUpdated);

      socket.emit("get_online_users", (ids: string[]) => setInitial(ids));
    };

    if (socket.connected) registerEvents();
    socket.on("connect", registerEvents);

    return () => {
      socket.off("connect", registerEvents);
    };
  }, [queryClient]);
}
