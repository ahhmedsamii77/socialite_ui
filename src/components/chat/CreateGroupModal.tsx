import { useState, useRef } from "react";
import { X, Users, ImagePlus, Loader2, Search } from "lucide-react";
import { useCreateGroup, useGetFriends } from "@/lib/apis/queries";
import type { UserType } from "@/types";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { getProfileImageUrl } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Props {
  currentUserId: string;
  onClose: () => void;
}

export default function CreateGroupModal({ currentUserId, onClose }: Props) {
  const [groupName, setGroupName] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<UserType[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: friends = [] } = useGetFriends() as { data: UserType[] };
  const { mutateAsync: createGroup, isPending } = useCreateGroup();

  const filteredResults = friends.filter(
    (u) => u._id !== currentUserId && !selected.find((s) => s._id === u._id) &&
      (search === "" || `${u.fName} ${u.lName} ${u.username}`.toLowerCase().includes(search.toLowerCase())),
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleCreate = async () => {
    if (!groupName.trim()) return toast.error("Group name is required");
    if (selected.length < 1) return toast.error("Add at least 1 participant");

    try {
      const formData = new FormData();
      formData.append("groupName", groupName.trim());
      selected.forEach((u) => formData.append("participants", u._id));
      if (image) formData.append("groupImage", image);

      await createGroup(formData);
      toast.success("Group created!");
      onClose();
    } catch {
      toast.error("Failed to create group");
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="create-post-modal sm:max-w-140 p-0 w-full max-h-[90vh] overflow-hidden flex flex-col gap-0 border border-border-strong rounded-4xl bg-secondary shadow-[0_32px_80px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.05)_inset] animate-fade-in-up"
      >
        {/* Header */}
        <DialogHeader className="flex-row items-center px-6 pt-6 pb-4 before:content-[''] before:h-0.75 before:top-0 before:left-0 before:right-0 before:absolute before:bg-linear-90 before:from-primary before:via-accent before:to-[#06b6d4] border-b border-border-strong gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
            <Users size={15} className="text-primary" />
          </div>
          <DialogTitle className="text-base font-bold text-foreground m-0! mt-0!">
            Create Group
          </DialogTitle>
        </DialogHeader>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Group image + name */}
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <button
                onClick={() => fileRef.current?.click()}
                className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center overflow-hidden border-2 border-dashed border-border-strong hover:border-primary/50 transition-colors cursor-pointer"
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="group" className="w-full h-full object-cover" />
                ) : (
                  <ImagePlus size={20} className="text-muted-foreground" />
                )}
              </button>
              {imagePreview && (
                <Button
                  type="button"
                  variant="default"
                  size="icon"
                  onClick={() => { setImage(null); setImagePreview(null); }}
                  className="absolute -top-1 -right-1 h-6 w-6 hover:bg-destructive bg-black/90 text-white flex items-center justify-center rounded-full cursor-pointer shadow-md transition-colors"
                >
                  <X size={12} />
                </Button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />

            <input
              className="flex-1 bg-muted/60 rounded-xl px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground border border-transparent focus:border-primary/50 transition-colors"
              placeholder="Group name…"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          {/* Selected participants */}
          {selected.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selected.map((u) => (
                <div
                  key={u._id}
                  className="flex items-center gap-1.5 bg-primary/10 text-primary text-xs px-2.5 py-1 rounded-full"
                >
                  <span>{u.fName} {u.lName}</span>
                  <button
                    onClick={() => setSelected((prev) => prev.filter((p) => p._id !== u._id))}
                    className="hover:text-destructive transition-colors cursor-pointer"
                  >
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Search */}
          <div className="flex items-center gap-2 bg-muted/60 rounded-xl px-3 py-2">
            <Search size={14} className="text-muted-foreground shrink-0" />
            <input
              className="bg-transparent text-sm outline-none flex-1 placeholder:text-muted-foreground"
              placeholder="Search people to add…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Results */}
          {filteredResults.length > 0 && (
            <div className="max-h-48 overflow-y-auto rounded-xl border border-border-strong divide-y divide-border-strong/40">
              {filteredResults.map((u) => (
                <button
                  key={u._id}
                  onClick={() => setSelected((prev) => [...prev, u])}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/40 transition-colors text-left cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
                    {u.profileImage ? (
                      <img src={getProfileImageUrl(u.profileImage)} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white bg-linear-[135deg] from-primary to-accent">
                        {u.fName?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{u.fName} {u.lName}</p>
                    <p className="text-xs text-muted-foreground">@{u.username}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t border-border-strong flex-row justify-end gap-2 bg-secondary/50">
          <Button variant="ghost" size="sm" className="rounded-xl cursor-pointer" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            className="rounded-xl cursor-pointer bg-linear-[135deg] from-primary to-accent text-white hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(139,92,246,0.55)] transition duration-200"
            onClick={handleCreate}
            disabled={isPending || !groupName.trim() || selected.length < 1}
          >
            {isPending ? <Loader2 size={14} className="animate-spin mr-1.5" /> : null}
            Create group
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
