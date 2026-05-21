import CommentSkeleton from "./CommentSkeleton";

export default function CommentListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3 mt-5">
      {Array.from({ length: count }).map((_, i) => (
        <CommentSkeleton key={i} />
      ))}
    </div>
  );
}
