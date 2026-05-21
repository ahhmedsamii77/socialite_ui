import { Users } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { useGetSuggestions } from "@/lib/apis/queries";
import type { UserType } from "@/types";
import SuggestionCard from "./SuggestionCard";
import SuggestionSkeleton from "./SuggestionSkeleton";

export default function Suggestions() {
  const { data: suggestions, isLoading } = useGetSuggestions();
  return (
    <Card className="border border-border-strong bg-card-base shadow-none rounded-2xl overflow-hidden gap-3! ">
      <CardHeader className="px-4">
        <h2 className="text-[12px] font-bold tracking-[0.07em] text-muted-foreground flex items-center gap-2 uppercase">
          <Users className="text-primary" size={14} />
          <span>Suggested for you</span>
        </h2>
      </CardHeader>

      <CardContent className="px-2">
        {isLoading && (
          <div className="space-y-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <SuggestionSkeleton key={i} />
            ))}
          </div>
        )}

        {!isLoading && (!suggestions || suggestions?.length === 0) && (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Users size={18} className="text-primary" />
            </div>
            <p className="text-[12px] text-muted-foreground">
              No suggestions right now
            </p>
          </div>
        )}

        {!isLoading && suggestions && suggestions.length > 0 && (
          <div className="divide-y divide-border-strong/40 animate-fade-in-up">
            {suggestions.map((user: UserType & { mutualFriendsCount?: number }) => (
              <SuggestionCard key={user?._id} user={user} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
