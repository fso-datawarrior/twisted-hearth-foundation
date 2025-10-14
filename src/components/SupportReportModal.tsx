import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { consoleCapture } from "@/lib/console-capture";
import { Upload, X, AlertCircle } from "lucide-react";

interface SupportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SupportReportModal({ isOpen, onClose }: SupportReportModalProps) {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || "");
  const [description, setDescription] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    setEmail(user?.email || "");
    setDescription("");
    setUploadedFile(null);
    setPreviewUrl(null);
    onClose();
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (PNG, JPG, etc.)",
        variant: "destructive",
      });
      return;
    }

    setUploadedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          handleFileSelect(file);
          toast({
            title: "Screenshot pasted!",
            description: "Your screenshot has been attached.",
          });
          e.preventDefault();
          break;
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !description) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // 1. Upload screenshot if present
      let screenshotUrl: string | undefined;
      if (uploadedFile) {
        const fileExt = uploadedFile.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('support-screenshots')
          .upload(fileName, uploadedFile);

        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('support-screenshots')
          .getPublicUrl(uploadData.path);
        
        screenshotUrl = publicUrl;
      }

      // 2. Get console logs
      const browserLogs = consoleCapture.getAuthLogs();

      // 3. Call edge function
      const { error } = await supabase.functions.invoke('send-support-report', {
        body: {
          email,
          description,
          screenshotUrl,
          userAgent: navigator.userAgent,
          browserLogs: browserLogs.slice(-20), // Last 20 auth-related logs
        },
      });

      if (error) throw error;

      // 4. Show success message with Halloween jargon
      toast({
        title: "🎃 Report Submitted!",
        description: "Our tech wizards are on it! Check your email for confirmation.",
        duration: 5000,
      });

      handleClose();
    } catch (error: any) {
      console.error('Support report submission error:', error);
      toast({
        title: "Failed to submit report",
        description: error.message || "Please try again or email us directly at fso@data-warrior.com",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const characterCount = description.length;
  const maxCharacters = 1000;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-[500px] mx-auto bg-background border-2 border-accent-gold/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-accent-gold flex items-center gap-2">
            <AlertCircle className="h-6 w-6" />
            Report Sign-In Issue
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="support-email" className="text-accent-gold">
              Email Address *
            </Label>
            <Input
              id="support-email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-background/50 border-accent-gold/30 focus:border-accent-gold text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-accent-gold flex justify-between">
              <span>Problem Description *</span>
              <span className="text-xs text-muted-foreground">
                {characterCount}/{maxCharacters}
              </span>
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the issue you're experiencing... (You can paste screenshots here too!)"
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, maxCharacters))}
              onPaste={handlePaste}
              required
              rows={5}
              className="bg-background/50 border-accent-gold/30 focus:border-accent-gold text-foreground resize-none"
            />
            <p className="text-xs text-muted-foreground">
              💡 Tip: You can paste screenshots directly into the text area!
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-accent-gold">Screenshot (Optional)</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
              className="hidden"
            />
            
            {previewUrl ? (
              <div className="relative border-2 border-accent-gold/30 rounded-lg p-2">
                <button
                  type="button"
                  onClick={() => {
                    setUploadedFile(null);
                    setPreviewUrl(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/80"
                >
                  <X className="h-4 w-4" />
                </button>
                <img
                  src={previewUrl}
                  alt="Screenshot preview"
                  className="w-full h-auto max-h-48 object-contain rounded"
                />
                <p className="text-xs text-center text-muted-foreground mt-2">
                  {uploadedFile?.name}
                </p>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-accent-gold/30 hover:border-accent-gold hover:bg-accent-gold/10"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Screenshot
              </Button>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !email || !description}
              className="flex-1 bg-accent-gold hover:bg-accent-gold/90 text-background"
            >
              {loading ? "Sending..." : "Submit Report"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
