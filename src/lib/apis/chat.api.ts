import { api } from "./apis";

// ─── REST endpoints ───────────────────────────────────────────────────────────

/** GET /chat — list all conversations */
export const getUserChats = (signal?: AbortSignal) =>
  api.get("/chat", { signal });

/** GET /chat/ovo/:userId — paginated direct chat */
export const getDirectChat = (
  userId: string,
  cursor?: string,
  signal?: AbortSignal,
) =>
  api.get(`/chat/ovo/${userId}`, {
    params: { cursor, limit: 20 },
    signal,
  });

/** GET /chat/group/:chatId — paginated group chat */
export const getGroupChat = (
  chatId: string,
  cursor?: string,
  signal?: AbortSignal,
) =>
  api.get(`/chat/group/${chatId}`, {
    params: { cursor, limit: 20 },
    signal,
  });

/** POST /chat/group — create a new group */
export const createGroup = (data: FormData) =>
  api.post("/chat/group", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

/** PATCH /chat/group/:chatId — update group name / image */
export const updateGroup = (chatId: string, data: FormData) =>
  api.patch(`/chat/group/${chatId}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

/** DELETE /chat/ovo/:chatId — delete a direct chat */
export const deleteDirectChat = (chatId: string) =>
  api.delete(`/chat/ovo/${chatId}`);

/** DELETE /chat/group/:chatId — delete/leave group */
export const deleteOrLeaveGroup = (chatId: string) =>
  api.delete(`/chat/group/${chatId}`);

/** DELETE /chat/:chatId/messages/:messageId */
export const deleteMessage = (chatId: string, messageId: string) =>
  api.delete(`/chat/${chatId}/messages/${messageId}`);

/** GET /chat/group/:chatId/participants — get participants list for a group */
export const getGroupParticipants = (chatId: string, signal?: AbortSignal) =>
  api.get(`/chat/group/${chatId}/participants`, { signal });

/** PATCH /chat/:chatId/freeze — admin: soft-delete any chat */
export const freezeChat = (chatId: string) =>
  api.patch(`/chat/${chatId}/freeze`);

/** PATCH /chat/:chatId/restore — admin: restore a soft-deleted chat */
export const restoreChat = (chatId: string) =>
  api.patch(`/chat/${chatId}/restore`);

/** DELETE /chat/:chatId/hard — admin: permanently delete a frozen chat */
export const hardDeleteChat = (chatId: string) =>
  api.delete(`/chat/${chatId}/hard`);
