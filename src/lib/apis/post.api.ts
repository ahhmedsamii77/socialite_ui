import { api } from "./apis";

export function createPost(data: FormData) {
  return api.post("/post", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export function getPosts(cursor?: string, signal?: AbortSignal) {
  return api.get("/post", {
    signal,
    params: { cursor },
  });
}

export function freezePost(postId: string) {
  return api.delete(`/post/${postId}/freeze`);
}

export function sharePost(postId: string) {
  return api.get(`/post/${postId}`);
}

export function updatePost(postId: string, data: FormData) {
  return api.patch(`/post/${postId}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export function likePost(postId: string) {
  return api.patch(`/post/${postId}/like`);
}

export function getComments(
  postId: string,
  cursor?: string,
  signal?: AbortSignal,
) {
  return api.get(`/post/${postId}/comment`, {
    signal,
    params: { cursor },
  });
}

export function createComment(postId: string, data: FormData) {
  return api.post(`/post/${postId}/comment`, data);
}

export function likeComment(postId: string, commentId: string) {
  return api.patch(`/post/${postId}/comment/${commentId}/like`);
}

export function savePost(postId: string) {
  return api.patch(`/post/${postId}/save`);
}

export function createReply(postId: string, commentId: string, data: FormData) {
  return api.post(`/post/${postId}/comment/${commentId}/reply`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export function getReplies(
  postId: string,
  commentId: string,
  cursor?: string,
  signal?: AbortSignal,
) {
  return api.get(`/post/${postId}/comment/${commentId}/reply`, {
    signal,
    params: { cursor },
  });
}

export function updateComment(
  postId: string,
  commentId: string,
  data: FormData,
) {
  return api.patch(`/post/${postId}/comment/${commentId}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export function freezeComment(postId:string, commentId: string) {
  return api.delete(`/post/${postId}/comment/${commentId}/freeze`);
}

export function hardDeletePost(postId: string) {
  return api.delete(`/post/${postId}`);
}

export function restorePost(postId: string) {
  return api.patch(`/post/${postId}/restore`);
}