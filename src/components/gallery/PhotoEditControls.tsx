import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Photo } from "@/lib/photo-api";
import { Edit, Trash2, X, Check } from "lucide-react";

interface PhotoEditControlsProps {
  photo: Photo;
  onUpdate: (photoId: string, updates: any) => void;
  onDelete: (photoId: string, storagePath: string) => void;
}

const SUGGESTED_TAGS = [
  "decorations",
  "lighting",
  "props",
  "group-photo",
  "candid",
  "close-up",
  "behind-the-scenes",
  "venue"
];

const CATEGORIES = [
  { value: "costumes", label: "Costumes" },
  { value: "food", label: "Food" },
  { value: "activities", label: "Activities" },
  { value: "general", label: "General" }
];

export const PhotoEditControls = ({ photo, onUpdate, onDelete }: PhotoEditControlsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [caption, setCaption] = useState(photo.caption || "");
  const [selectedTags, setSelectedTags] = useState<string[]>(photo.tags || []);
  const [category, setCategory] = useState<string>(photo.category || "general");

  const handleSave = () => {
    onUpdate(photo.id, {
      caption: caption.trim() || undefined,
      tags: selectedTags,
      category: category as any
    });
    setIsEditing(false);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div className="absolute top-2 right-2 flex gap-2 z-10">
      {!isEditing ? (
        <>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                size="sm"
                variant="secondary"
                className="h-8 w-8 p-0 bg-background/90 backdrop-blur-sm hover:bg-background"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-bg-2 border-accent-purple/30">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-subhead text-accent-gold mb-2">Caption</Label>
                  <Input
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Add a caption..."
                    className="bg-background border-accent-purple/20"
                  />
                </div>

                <div>
                  <Label className="text-sm font-subhead text-accent-gold mb-2">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="bg-background border-accent-purple/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-bg-2 border-accent-purple/30">
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-subhead text-accent-gold mb-2">Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_TAGS.map(tag => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        className={`cursor-pointer ${
                          selectedTags.includes(tag)
                            ? "bg-accent-gold/20 text-accent-gold border-accent-gold"
                            : "border-accent-purple/30 hover:border-accent-gold/50"
                        }`}
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSave}
                    className="flex-1 bg-accent-gold text-background hover:bg-accent-gold/90"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditing(false)}
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            size="sm"
            variant="destructive"
            className="h-8 w-8 p-0 bg-red-500/90 backdrop-blur-sm hover:bg-red-600"
            onClick={() => {
              if (confirm("Are you sure you want to delete this photo?")) {
                onDelete(photo.id, photo.storage_path);
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </>
      ) : null}
    </div>
  );
};
