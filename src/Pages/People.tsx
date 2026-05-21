import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Users, Clock, Inbox, Loader2, UserSearch, X } from "lucide-react";
import useDebounce from "@/hooks/useDebounce";
import {
  useGetIncomingRequests,
  useGetOutgoingRequests,
  useSearchPeople,
} from "@/lib/apis/queries";
import { DiscoverCard, RequestCard } from "@/components/People/PeopleCard";
import { PeopleCardSkeletonGrid } from "@/components/People/PeopleCardSkeleton";


function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-[inset_0_0_0_1px_rgba(139,92,246,0.15)]">
        <Icon className="text-primary/60" size={28} />
      </div>
      <div className="text-center">
        <p className="text-[14.5px] font-bold text-foreground">{title}</p>
        <p className="text-[12.5px] text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  );
}


function ResultsGrid({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div>
      <p className="text-[12px] text-muted-foreground mb-4 font-medium">{label}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {children}
      </div>
    </div>
  );
}


export default function People() {
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 400);

  const { data: searchResults, isLoading: isSearching, isFetching } =
    useSearchPeople(debouncedSearch);

  const { data: incomingRequests, isLoading: isLoadingIncoming } =
    useGetIncomingRequests();

  const { data: outgoingRequests, isLoading: isLoadingOutgoing } =
    useGetOutgoingRequests();

  const isSearchLoading = (isSearching || isFetching) && debouncedSearch.trim().length >= 1;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

      <div>
        <h1 className="text-[22px] font-bold text-foreground">People</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          Discover, connect, and manage your friend requests
        </p>
      </div>

      <Tabs defaultValue="discover">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <TabsList  className="bg-card!  border border-border-strong p-1! h-auto! rounded-2xl! gap-0.5!">

            <TabsTrigger
              value="discover"
              className="cursor-pointer rounded-xl! px-4! py-2! text-[13px]! font-semibold! gap-2!
                data-[state=active]:bg-primary/10! data-[state=active]:text-primary!
                data-[state=active]:shadow-[inset_0_0_0_1px_rgba(139,92,246,0.25)]!"
            >
              <UserSearch size={14} />
              Discover
            </TabsTrigger>

            <TabsTrigger
              value="received"
              className="cursor-pointer rounded-xl! px-4! py-2! text-[13px]! font-semibold! gap-2!
                data-[state=active]:bg-primary/10! data-[state=active]:text-primary!
                data-[state=active]:shadow-[inset_0_0_0_1px_rgba(139,92,246,0.25)]!"
            >
              <Inbox size={14} />
              Received
              {!!incomingRequests?.length && (
                <span className="min-w-4.5 h-4.5 px-1 rounded-full text-[10px] font-bold bg-primary text-white flex items-center justify-center">
                  {incomingRequests.length}
                </span>
              )}
            </TabsTrigger>

            <TabsTrigger
              value="sent"
              className="cursor-pointer rounded-xl! px-4! py-2! text-[13px]! font-semibold! gap-2!
                data-[state=active]:bg-primary/10! data-[state=active]:text-primary!
                data-[state=active]:shadow-[inset_0_0_0_1px_rgba(139,92,246,0.25)]!"
            >
              <Clock size={14} />
              Sent
              {!!outgoingRequests?.length && (
                <span className="min-w-4.5 h-4.5 px-1 rounded-full text-[10px] font-bold bg-amber-500 text-white flex items-center justify-center">
                  {outgoingRequests.length}
                </span>
              )}
            </TabsTrigger>

          </TabsList>

          <div className="relative w-full sm:w-72">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <Input
              id="people-search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search people…"
              className="pl-9 pr-9 h-10 rounded-full bg-card border-border-strong text-[13.5px] focus-visible:ring-primary/30"
            />
            {isSearchLoading && (
              <Loader2 size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-primary animate-spin" />
            )}
            {searchInput && !isSearchLoading && (
              <button
                onClick={() => setSearchInput("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <TabsContent value="discover" className="mt-5 animate-fade-in">
          {!debouncedSearch.trim() && (
            <EmptyState
              icon={Search}
              title="Search for people"
              description="Type a name or username to find people you know"
            />
          )}

          {isSearchLoading && <PeopleCardSkeletonGrid count={8} />}

          {!isSearchLoading && debouncedSearch.trim() && !!searchResults?.length && (
            <ResultsGrid
              label={`${searchResults.length} result${searchResults.length !== 1 ? "s" : ""} for "${debouncedSearch}"`}
            >
              {searchResults.map((user, i) => (
                <div key={user._id} className="animate-fade-in-up" style={{ animationDelay: `${i * 40}ms` }}>
                  <DiscoverCard user={user} />
                </div>
              ))}
            </ResultsGrid>
          )}

          {!isSearchLoading && debouncedSearch.trim() && searchResults?.length === 0 && (
            <EmptyState
              icon={UserSearch}
              title="No results found"
              description={`Nobody matched "${debouncedSearch}". Try a different name or username.`}
            />
          )}
        </TabsContent>

        <TabsContent value="received" className="mt-5 animate-fade-in">
          {isLoadingIncoming && <PeopleCardSkeletonGrid count={6} />}

          {!isLoadingIncoming && !!incomingRequests?.length && (
            <ResultsGrid
              label={`${incomingRequests.length} pending request${incomingRequests.length !== 1 ? "s" : ""}`}
            >
              {incomingRequests.map((user, i) => (
                <div key={user._id} className="animate-fade-in-up" style={{ animationDelay: `${i * 40}ms` }}>
                  <RequestCard user={user} requestId={user.requestId} type="received" />
                </div>
              ))}
            </ResultsGrid>
          )}

          {!isLoadingIncoming && !incomingRequests?.length && (
            <EmptyState
              icon={Inbox}
              title="No friend requests"
              description="When someone sends you a friend request, it will appear here."
            />
          )}
        </TabsContent>

        <TabsContent value="sent" className="mt-5 animate-fade-in">
          {isLoadingOutgoing && <PeopleCardSkeletonGrid count={6} />}

          {!isLoadingOutgoing && !!outgoingRequests?.length && (
            <ResultsGrid
              label={`${outgoingRequests.length} sent request${outgoingRequests.length !== 1 ? "s" : ""}`}
            >
              {outgoingRequests.map((user, i) => (
                <div key={user._id} className="animate-fade-in-up" style={{ animationDelay: `${i * 40}ms` }}>
                  <RequestCard user={user} requestId={user.requestId} type="sent" />
                </div>
              ))}
            </ResultsGrid>
          )}

          {!isLoadingOutgoing && !outgoingRequests?.length && (
            <EmptyState
              icon={Users}
              title="No sent requests"
              description="When you send someone a friend request, it will appear here."
            />
          )}
        </TabsContent>

      </Tabs>
    </div>
  );
}
