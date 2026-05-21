import type {
  confirmEmailSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
  verifyResetPasswordSchema,
} from "@/components/auth/schema";
import { z } from "zod";
import { sendResetPasswordOtpSchema } from "../components/auth/schema";
export type SignupType = z.infer<typeof signupSchema>;
export type AuthType = {
  access_Token: string;
  refresh_Token: string;
  role: string;
  setAccess_Token: (access_Token: string) => void;
  setRefresh_Token: (refresh_Token: string) => void;
  setRole: (role: string) => void;
  clearAuth: () => void;
};

export type LoginType = z.infer<typeof loginSchema>;
export type ConfirmEmailType = z.infer<typeof confirmEmailSchema>;
export type SendResetPasswordOtpType = z.infer<
  typeof sendResetPasswordOtpSchema
>;
export type VerifyResetPasswordType = z.infer<typeof verifyResetPasswordSchema>;
export type ResetPasswordType = z.infer<typeof resetPasswordSchema>;

export type UserType = {
  _id: string;
  fName: string;
  lName: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  gender: string;
  role: string;
  friends: UserType[];
  profileImage: string;
  username: string;
  tempProfileImage: string;
  coverImages: string[];
  changeCredentialsTime: Date;
  provider: string;
  deletedAt: Date;
  deletedBy: string;
  reStoredAt: Date;
  reStoredBy: string;
  createdAt: Date;
  updatedAt: Date;
  savedPosts: string[];
  posts?: PostType[];
};

export type PostType = {
  _id: string;
  createdBy: UserType;
  content?: string;
  attachments?: string[];
  tags?: UserType[];
  likes?: string[];
  allowComments?: "allow" | "deny";
  availability?: "public" | "only_me" | "friends";
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  deletedBy?: string;
  comments: CommentType[];
};

export type CommentType = {
  _id: string;
  createdBy: UserType;
  content?: string;
  attachments?: string[];
  likes?: string[];
  tags?: UserType[];
  postId: string;
  commentId?: string;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  deletedBy?: string;
  reStoredAt?: Date;
  reStoredBy?: string;
};


export type FriendshipStatus = "none" | "friends" | "received" | "sent";

export type NotificationTypeEnum =
  | "friend_request"
  | "friend_accepted"
  | "post_like"
  | "post_comment"
  | "comment_like"
  | "comment_reply";

export type NotificationType = {
  _id: string;
  recipient: string;
  sender: UserType;
  type: NotificationTypeEnum;
  message: string;
  isRead: boolean;
  refId?: string;
  refModel?: string;
  createdAt: string;
  updatedAt: string;
};

export type FriendRequestType = {
  _id: string;
  sender: UserType;
  receiver: UserType;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  updatedAt: string;
};

// ─── Chat Types ───────────────────────────────────────────────────────────────

export type MessageType = {
  _id: string;
  createdBy: UserType;
  content?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
  deletedBy?: string;
};

export type ChatType = {
  _id: string;
  createdBy: string | UserType;
  participants: UserType[];
  messages: MessageType[];
  // OVM
  groupName?: string;
  groupImage?: string;
  roomId?: string;
  // timestamps
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
};

