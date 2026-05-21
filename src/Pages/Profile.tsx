import FriendsSection from "@/components/Profile/FriendsSection";
import ProfileHeader from "@/components/Profile/ProfileHeader";
import ProfileHeaderSkeleton from "@/components/Profile/ProfileHeaderSkeleton";
import ProfilePosts from "@/components/Profile/ProfilePosts";
import { useCheckFriendShipStatus, useShareProfile } from "@/lib/apis/queries";
import { useParams } from "react-router-dom";

export default function Profile() {
  const { userId } = useParams();
  const { data: profileData, isLoading: isSharingProfileLoading } = useShareProfile(userId!);
  const { data: friendshipStatus, isLoading: isLoadingFriendship } = useCheckFriendShipStatus(profileData?._id!);

  return (
    <div className="p-[30px_20px_80px] space-y-7">
      {(isSharingProfileLoading || isLoadingFriendship) ? (
        <ProfileHeaderSkeleton />
      ) : (
        <ProfileHeader friendshipStatus={friendshipStatus!} profileData={profileData!} />
      )}
      <FriendsSection friends={profileData?.friends || []} isLoading={isSharingProfileLoading} />
      <ProfilePosts posts={profileData?.posts || []} isLoading={isSharingProfileLoading} />
    </div>
  );
}

