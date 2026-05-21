import { Card, CardContent, CardHeader } from "../ui/card";
import type { UserType } from "@/types";
import { Users } from "lucide-react";
import { useState } from "react";
import { useInView } from "react-intersection-observer";
import FriendCard from "./FriendCard";
import { FriendCardSkeleton } from "./FriendsSectionSkeleton";

function RevealCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-500 ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      {children}
    </div>
  );
}

const PAGE_SIZE = 6;

export default function FriendsSection({
  friends,
  isLoading,
}: {
  friends: UserType[];
  isLoading?: boolean;
}) {
  const [showAll, setShowAll] = useState(false);
  const visibleFriends = showAll ? friends : friends.slice(0, PAGE_SIZE);
  const hasMore = friends.length > PAGE_SIZE;

  const { ref: bottomRef, inView: bottomInView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <Card className="max-w-240 mx-auto rounded-2xl border border-border-strong shadow-md animate-fade-in-up overflow-hidden hover:shadow-[0_8px_32px_rgba(139,92,246,0.07)] transition duration-300">
      <CardHeader className="pb-3 border-b border-border-strong">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shadow-[inset_0_0_0_1px_#8B5CF622]">
              <Users className="text-primary" size={17} />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-foreground leading-tight">Friends</h2>
              <p className="text-[12px] text-muted-foreground leading-tight">
                {isLoading ? "Loading..." : `${friends.length} in total`}
              </p>
            </div>
          </div>

          {hasMore && !isLoading && (
            <button
              onClick={() => setShowAll((p) => !p)}
              className="text-[12.5px] font-semibold text-primary hover:underline underline-offset-2 cursor-pointer transition-all"
            >
              {showAll ? "Show less" : `See all ${friends.length}`}
            </button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-5 pb-6">
        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <FriendCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!isLoading && friends.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="w-16 h-16 rounded-full bg-muted/50 border border-border-strong flex items-center justify-center">
              <Users className="text-muted-foreground/50" size={28} />
            </div>
            <div className="text-center">
              <p className="text-[14px] font-semibold text-foreground">No friends yet</p>
              <p className="text-[12.5px] text-muted-foreground mt-1">Friends will appear here once added.</p>
            </div>
          </div>
        )}

        {!isLoading && friends.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {visibleFriends.map((friend, i) => (
                <RevealCard key={friend._id} delay={i * 60}>
                  <FriendCard friend={friend} />
                </RevealCard>
              ))}
            </div>

            {hasMore && (
              <div ref={bottomRef} className="mt-5 flex justify-center">
                <button
                  onClick={() => setShowAll((p) => !p)}
                  className={`transition-all duration-500 text-[13px] font-semibold px-6 py-2 rounded-full border border-primary/30 text-primary
                    hover:bg-primary/10 cursor-pointer ${bottomInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
                >
                  {showAll ? "Show less" : `See all ${friends.length} friends`}
                </button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
