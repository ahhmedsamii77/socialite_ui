import { useState, useRef } from "react";
import { ImagePlus, Loader2, Pencil, Trash2, X } from "lucide-react";
import { useUpdateGroup } from "@/lib/apis/queries";
import type { ChatType } from "@/types";
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
  chat: ChatType;
  onClose: () => void;
}

export default function EditGroupModal({ chat, onClose }: Props) {
  const [groupName, setGroupName] = useState(chat.groupName ?? "");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    chat.groupImage ? getProfileImageUrl(chat.groupImage) ?? null : null
  );
  const [removeImage, setRemoveImage] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { mutateAsync: updateGroup, isPending } = useUpdateGroup();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setRemoveImage(false);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
    setRemoveImage(true);
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      if (groupName.trim() !== chat.groupName) {
        formData.append("groupName", groupName.trim());
      }
      if (image) {
        formData.append("groupImage", image);
      }
      if (removeImage) {
        formData.append("removeImage", "true");
      }

      await updateGroup({ chatId: chat._id, data: formData });
      toast.success("Group updated!");
      onClose();
    } catch {
      toast.error("Failed to update group");
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
            <Pencil size={13} className="text-primary" />
          </div>
          <DialogTitle className="text-base font-bold text-foreground m-0! mt-0!">
            Edit Group
          </DialogTitle>
        </DialogHeader>

        {/* Body */}
        <div className="p-5 space-y-5">
          {/* Group Image */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <button
                onClick={() => fileRef.current?.click()}
                className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center overflow-hidden border-2 border-dashed border-border-strong hover:border-primary/50 transition-colors cursor-pointer"
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="group" className="w-full h-full object-cover" />
                ) : (
                  <ImagePlus size={22} className="text-muted-foreground" />
                )}
              </button>
              {imagePreview && (
                <Button
                  type="button"
                  variant="default"
                  size="icon"
                  onClick={handleRemoveImage}
                  className="absolute -top-1 -right-1 h-7 w-7 hover:bg-destructive bg-black/90 text-white flex items-center justify-center rounded-full cursor-pointer shadow-md transition-colors"
                >
                  <X size={14} />
                </Button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1 text-primary hover:underline cursor-pointer"
              >
                <ImagePlus size={12} />
                {imagePreview ? "Change photo" : "Add photo"}
              </button>
              {imagePreview && (
                <>
                  <span>·</span>
                  <button
                    onClick={handleRemoveImage}
                    className="flex items-center gap-1 text-destructive hover:underline cursor-pointer"
                  >
                    <Trash2 size={12} />
                    Remove
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Group name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Group name
            </label>
            <input
              className="w-full bg-muted/60 rounded-xl px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground border border-transparent focus:border-primary/50 transition-colors"
              placeholder="Group name…"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t border-border-strong flex-row justify-end gap-2 bg-secondary/50">
          <Button variant="ghost" size="sm" className="rounded-xl cursor-pointer" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            className="rounded-xl cursor-pointer bg-linear-[135deg] from-primary to-accent text-white hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(139,92,246,0.55)] transition duration-200"
            onClick={handleSave}
            disabled={
              isPending ||
              !groupName.trim() ||
              (groupName.trim() === chat.groupName && !image && !removeImage)
            }
          >
            {isPending ? <Loader2 size={14} className="animate-spin mr-1.5" /> : null}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
