import { api } from "./apis";

export function getUserData(signal?: AbortSignal) {
  return api.get("/user/profile", { signal });
}

export function getUsers(
  search?: string,
  users?: string[],
  signal?: AbortSignal,
) {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (users?.length) params.append("users", users.join(","));
  return api.get(`/user?${params.toString()}`, { signal });
}

export function logout(flag: string = "single") {
  return api.post("/user/logout", { flag });
}

export function shareProfile(userId: string, signal?: AbortSignal) {
  return api.get(`/user/${userId}`, { signal });
}

export function uploadCoverImages(data: FormData) {
  return api.patch("/user/cover-images", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export function uploadProfileImage(data: FormData) {
  return api.patch("/user/profile-image", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export function deleteProfileImage() {
  return api.delete("/user/profile-image");
}

export function deleteCoverImages() {
  return api.delete("/user/cover-images");
}

export function getSuggestions(signal?: AbortSignal) {
  return api.get("/user/suggestions", { signal });
}

export function getFriends(signal?: AbortSignal) {
  return api.get("/user/friends", { signal });
}

export function checkFriendShipStatus(userId: string, signal?: AbortSignal) {
  return api.get(`/user/${userId}/check-friendship`, { signal });
}

export function removeFriend(friendId: string) {
  return api.delete(`/user/${friendId}/remove-friend`);
}

export function sendFriendRequest(userId: string) {
  return api.post(`/user/${userId}/send-friend-request`);
}

export function getIncomingRequests(signal?: AbortSignal) {
  return api.get("/user/friend-requests/incoming", { signal });
}

export function getOutgoingRequests(signal?: AbortSignal) {
  return api.get("/user/friend-requests/outgoing", { signal });
}


export function cancelRequest(requestId: string) {
  return api.delete(`/user/cancel-request/${requestId}`);
}

export function acceptRequest(requestId: string) {
  return api.patch(`/user/accept-friend-request/${requestId}`);
}

export function rejectRequest(requestId: string) {
  return api.patch(`/user/reject-friend-request/${requestId}`);
}

export function updateProfile(data: {
  fName?: string;
  lName?: string;
  username?: string;
  phone?: string;
  address?: string;
  gender?: string;
}) {
  return api.patch("/user", data);
}

export function updatePassword(data: {
  currentPassword: string;
  newPassword: string;
}) {
  return api.patch("/user/update-password", data);
}

export function freezeAccount() {
  return api.delete("/user/freeze");
}

export function freezeUserByAdmin(userId: string) {
  return api.delete(`/user/${userId}/freeze`);
}

// ── Admin APIs ──────────────────────────────────────────────────────────────

export function getDashboard(signal?: AbortSignal) {
  return api.get("/user/dashboard", { signal });
}

export function hardDeleteUser(userId: string) {
  return api.delete(`/user/${userId}`);
}

export function changeRole(userId: string, role: string) {
  return api.patch(`/user/${userId}/change-role`, { role });
}

export function restoreUser(userId: string) {
  return api.patch(`/user/${userId}/restore`);
}

export function hardDeletePost(postId: string) {
  return api.delete(`/post/${postId}`);
}

